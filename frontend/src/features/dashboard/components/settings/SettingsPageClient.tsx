"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types/user";
import { Tabs, ConfirmDialog, Text } from "@/shared/ui";
import { toast } from "react-hot-toast";
import { useProfileSettings } from "../../hooks/useProfileSettings";
import { useSecuritySettings } from "../../hooks/useSecuritySettings";
import { usePreferenceSettings } from "../../hooks/usePreferenceSettings";
import ProfileSettingsSection from "./ProfileSettingsSection";
import SecuritySettingsSection from "./SecuritySettingsSection";
import PreferenceSettingsSection from "./PreferenceSettingsSection";

interface SettingsPageClientProps {
  initialProfile: UserProfile;
}

export default function SettingsPageClient({ initialProfile }: SettingsPageClientProps) {
  // 1. Profile settings hook
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    isSaving: isSavingProfile,
    handleSave: handleSaveProfile
  } = useProfileSettings(initialProfile.first_name || "", initialProfile.last_name || "");

  // 2. Security settings hook
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving: isSavingSecurity,
    handleSave: handleSaveSecurity
  } = useSecuritySettings();

  // 3. Preference settings hook
  const privacy = initialProfile.candidate_profile?.privacy_settings || {};
  const {
    twoFactor,
    emailPromo,
    smsAlerts,
    pushAlerts,
    publicProfile,
    recruitersOnly,
    handleToggle2FA,
    handleToggleEmailPromo,
    handleToggleSmsAlerts,
    handleTogglePushAlerts,
    handleTogglePublicProfile,
    handleToggleRecruitersOnly
  } = usePreferenceSettings(
    false, // TOTP 2FA default
    true,  // emailPromo default
    false, // smsAlerts default
    true,  // pushAlerts default
    privacy.public_profile ?? true,
    privacy.visible_to_recruiters_only ?? false
  );

  // 4. Delete Dialog local state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setTimeout(() => {
      setDeletingAccount(false);
      setIsDeleteDialogOpen(false);
      toast.success("Account deletion request submitted.");
    }, 2000);
  };

  const tabItems = [
    {
      id: "account",
      label: "Account",
      icon: "person",
      content: (
        <ProfileSettingsSection
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={initialProfile.email}
          isSaving={isSavingProfile}
          onSave={handleSaveProfile}
        />
      )
    },
    {
      id: "security",
      label: "Security",
      icon: "lock",
      content: (
        <SecuritySettingsSection
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isSaving={isSavingSecurity}
          onSave={handleSaveSecurity}
          twoFactor={twoFactor}
          onToggle2FA={handleToggle2FA}
          onOpenDelete={() => setIsDeleteDialogOpen(true)}
        />
      )
    },
    {
      id: "notifications",
      label: "Notifications & Privacy",
      icon: "notifications",
      content: (
        <PreferenceSettingsSection
          emailPromo={emailPromo}
          onToggleEmailPromo={handleToggleEmailPromo}
          smsAlerts={smsAlerts}
          onToggleSmsAlerts={handleToggleSmsAlerts}
          pushAlerts={pushAlerts}
          onTogglePushAlerts={handleTogglePushAlerts}
          publicProfile={publicProfile}
          onTogglePublicProfile={handleTogglePublicProfile}
          recruitersOnly={recruitersOnly}
          onToggleRecruitersOnly={handleToggleRecruitersOnly}
          onOpenDelete={() => setIsDeleteDialogOpen(true)}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-left animate-fade-in">
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
