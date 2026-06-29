import React from "react";
import { Input, Button, Card, Text } from "@/shared/ui";

interface ProfileSettingsSectionProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  isSaving: boolean;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ProfileSettingsSection({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  isSaving,
  onSave
}: ProfileSettingsSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6 text-left">
        <div>
          <Text variant="h3" className="text-text mb-1 font-semibold">Account Information</Text>
          <Text variant="body-sm" color="muted">Update your account login and name details.</Text>
        </div>
        
        <form onSubmit={onSave} className="space-y-5 max-w-lg">
          <div className="flex gap-4">
            <Input
              label="First name"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isSaving}
            />
            <Input
              label="Last name"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isSaving}
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

          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </form>
      </div>
    </Card>
  );
}
