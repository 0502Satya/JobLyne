import React from "react";
import { Input, Button, Card, Text, Toggle } from "@/shared/ui";
import { Trash2 } from "lucide-react";

interface SecuritySettingsSectionProps {
  currentPassword:  string;
  setCurrentPassword: (val: string) => void;
  newPassword:  string;
  setNewPassword: (val: string) => void;
  confirmPassword:  string;
  setConfirmPassword: (val: string) => void;
  isSaving: boolean;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  twoFactor: boolean;
  onToggle2FA: (checked: boolean) => void;
  onOpenDelete: () => void;
}

export default function SecuritySettingsSection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isSaving,
  onSave,
  twoFactor,
  onToggle2FA,
  onOpenDelete
}: SecuritySettingsSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-8 text-left">
        <div className="space-y-6 max-w-lg">
          <div>
            <Text variant="h3" className="text-text mb-1 font-semibold">Change Password</Text>
            <Text variant="body-sm" color="muted">Set a secure password to protect your account.</Text>
          </div>

          <form onSubmit={onSave} className="space-y-5">
            <Input
              label="Current password"
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              showVisibilityToggle
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
            />

            <Button type="submit" isLoading={isSaving}>
              Change Password
            </Button>
          </form>
        </div>

        <hr className="border-border" />

        <div className="space-y-4 max-w-lg">
          <div>
            <Text variant="h3" className="text-text mb-1 font-semibold">Two-Factor Authentication (2FA)</Text>
            <Text variant="body-sm" color="muted">Add an extra layer of protection to your account using TOTP.</Text>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
            <div className="space-y-0.5">
              <Text variant="body-sm" weight="semibold" className="text-text">Authenticator App</Text>
              <Text variant="caption" color="muted">Secure your account with multi-factor TOTP codes.</Text>
            </div>
            <Toggle
              checked={twoFactor}
              onChange={onToggle2FA}
              aria-label="Toggle Authenticator App"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
