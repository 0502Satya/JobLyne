"use client";

import React, { useState, useEffect } from "react";
import {
  getUserProfileAction,
  updateUserProfileAction,
  changePasswordAction
} from "@/features/auth/actions";
import {
  Input,
  Button,
  Tabs,
  Toggle,
  ConfirmDialog,
  Text,
  Card,
  toast,
  LoadingState
} from "@/shared/ui";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toggle states
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailPromo, setEmailPromo] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [recruitersOnly, setRecruitersOnly] = useState(false);

  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfileAction();
        if (data.error) {
          toast.error("Failed to load settings profile.");
        } else {
          setProfile(data);
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setEmail(data.email || "");
          if (data.candidate_profile?.privacy_settings) {
            const privacy = data.candidate_profile.privacy_settings;
            setPublicProfile(privacy.public_profile ?? true);
            setRecruitersOnly(privacy.visible_to_recruiters_only ?? false);
          }
        }
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await updateUserProfileAction({
        first_name: firstName,
        last_name: lastName
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile details updated successfully.");
        setProfile(res);
      }
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await changePasswordAction({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setTimeout(() => {
      setDeletingAccount(false);
      setIsDeleteDialogOpen(false);
      toast.success("Account deletion request submitted.");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingState variant="list" />
      </div>
    );
  }

  const tabItems = [
    {
      id: "account",
      label: "Account",
      icon: "person",
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Text variant="h3" className="text-text mb-1">Account Information</Text>
              <Text variant="body-sm" color="muted">Update your account login and name details.</Text>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
              <div className="flex gap-4">
                <Input
                  label="First name"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={updatingProfile}
                />
                <Input
                  label="Last name"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={updatingProfile}
                />
              </div>

              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
                helper="Contact support to change your login email address."
              />

              <Button type="submit" isLoading={updatingProfile}>
                Save Changes
              </Button>
            </form>
          </div>
        </Card>
      )
    },
    {
      id: "security",
      label: "Security",
      icon: "lock",
      content: (
        <Card className="p-6">
          <div className="space-y-8">
            <div className="space-y-6 max-w-lg">
              <div>
                <Text variant="h3" className="text-text mb-1">Change Password</Text>
                <Text variant="body-sm" color="muted">Set a secure password to protect your account.</Text>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <Input
                  label="Current password"
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  showVisibilityToggle
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={updatingPassword}
                />

                <Input
                  label="New password"
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  showVisibilityToggle
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={updatingPassword}
                  helper="Must be at least 8 characters."
                />

                <Input
                  label="Confirm new password"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  showVisibilityToggle
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={updatingPassword}
                />

                <Button type="submit" isLoading={updatingPassword}>
                  Change Password
                </Button>
              </form>
            </div>

            <hr className="border-border" />

            <div className="space-y-4 max-w-lg">
              <div>
                <Text variant="h3" className="text-text mb-1">Two-Factor Authentication (2FA)</Text>
                <Text variant="body-sm" color="muted">Add an extra layer of protection to your account using TOTP.</Text>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Authenticator App</Text>
                  <Text variant="caption" color="muted">Secure your account with multi-factor TOTP codes.</Text>
                </div>
                <Toggle
                  checked={twoFactor}
                  onChange={(checked) => {
                    setTwoFactor(checked);
                    toast.success(checked ? "2FA enabled successfully." : "2FA disabled successfully.");
                  }}
                  aria-label="Toggle Authenticator App"
                />
              </div>
            </div>
          </div>
        </Card>
      )
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
      content: (
        <Card className="p-6">
          <div className="space-y-6 max-w-lg">
            <div>
              <Text variant="h3" className="text-text mb-1">Notification Preferences</Text>
              <Text variant="body-sm" color="muted">Choose how you receive alerts and communications.</Text>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Email Notifications</Text>
                  <Text variant="caption" color="muted">Receive job matches, application statuses, and announcements via email.</Text>
                </div>
                <Toggle
                  checked={emailPromo}
                  onChange={(checked) => {
                    setEmailPromo(checked);
                    toast.success(`Email alerts ${checked ? 'enabled' : 'disabled'}.`);
                  }}
                  aria-label="Toggle Email Notifications"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">SMS Alerts</Text>
                  <Text variant="caption" color="muted">Receive important status reminders via text messages.</Text>
                </div>
                <Toggle
                  checked={smsAlerts}
                  onChange={(checked) => {
                    setSmsAlerts(checked);
                    toast.success(`SMS alerts ${checked ? 'enabled' : 'disabled'}.`);
                  }}
                  aria-label="Toggle SMS Alerts"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Desktop Push Alerts</Text>
                  <Text variant="caption" color="muted">Show real-time notifications on screen when browser is open.</Text>
                </div>
                <Toggle
                  checked={pushAlerts}
                  onChange={(checked) => {
                    setPushAlerts(checked);
                    toast.success(`Push alerts ${checked ? 'enabled' : 'disabled'}.`);
                  }}
                  aria-label="Toggle Desktop Push Alerts"
                />
              </div>
            </div>
          </div>
        </Card>
      )
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: "security",
      content: (
        <Card className="p-6">
          <div className="space-y-8">
            <div className="space-y-6 max-w-lg">
              <div>
                <Text variant="h3" className="text-text mb-1">Discoverability Settings</Text>
                <Text variant="body-sm" color="muted">Manage who can view your profile on JobLyne.</Text>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                  <div className="space-y-0.5">
                    <Text variant="body-sm" weight="semibold" className="text-text">Public Profile</Text>
                    <Text variant="caption" color="muted">Allow anyone on the internet to search and view your credentials.</Text>
                  </div>
                  <Toggle
                    checked={publicProfile}
                    onChange={(checked) => {
                      setPublicProfile(checked);
                      toast.success(`Public visibility ${checked ? 'enabled' : 'disabled'}.`);
                    }}
                    aria-label="Toggle Public Profile"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                  <div className="space-y-0.5">
                    <Text variant="body-sm" weight="semibold" className="text-text">Visible to Recruiters Only</Text>
                    <Text variant="caption" color="muted">Hide your resume profile from other standard job candidates.</Text>
                  </div>
                  <Toggle
                    checked={recruitersOnly}
                    onChange={(checked) => {
                      setRecruitersOnly(checked);
                      toast.success(`Recruiter-only access ${checked ? 'enabled' : 'disabled'}.`);
                    }}
                    aria-label="Toggle Visible to Recruiters Only"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4 max-w-lg">
              <div>
                <Text variant="h3" className="text-error mb-1">Deactivate or Delete Account</Text>
                <Text variant="body-sm" color="muted">Permanently delete your profile, documents, and historical data.</Text>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-error/20 bg-error-bg/20">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Delete Profile Permanently</Text>
                  <Text variant="caption" color="muted">This action is irreversible and erases all records.</Text>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h1" className="text-text mb-1">Settings</Text>
        <Text variant="body" color="muted">Manage your account information, security credentials, and visibility preferences.</Text>
      </div>

      <Tabs items={tabItems} variant="underline" />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirm Account Deletion"
        description="This will permanently delete your JobLyne account, including all your job applications, saved configurations, and profile documents. This action is completely irreversible."
        confirmLabel="Delete My Account"
        variant="danger"
        isLoading={deletingAccount}
      />
    </div>
  );
}
