import React from "react";
import { Button, Card, Text, Toggle } from "@/shared/ui";
import { Trash2 } from "lucide-react";

interface PreferenceSettingsSectionProps {
  emailPromo: boolean;
  onToggleEmailPromo: (checked: boolean) => void;
  smsAlerts: boolean;
  onToggleSmsAlerts: (checked: boolean) => void;
  pushAlerts: boolean;
  onTogglePushAlerts: (checked: boolean) => void;
  publicProfile: boolean;
  onTogglePublicProfile: (checked: boolean) => void;
  recruitersOnly: boolean;
  onToggleRecruitersOnly: (checked: boolean) => void;
  onOpenDelete: () => void;
}

export default function PreferenceSettingsSection({
  emailPromo,
  onToggleEmailPromo,
  smsAlerts,
  onToggleSmsAlerts,
  pushAlerts,
  onTogglePushAlerts,
  publicProfile,
  onTogglePublicProfile,
  recruitersOnly,
  onToggleRecruitersOnly,
  onOpenDelete
}: PreferenceSettingsSectionProps) {
  return (
    <div className="space-y-8 text-left">
      <Card className="p-6">
        <div className="space-y-6 max-w-lg">
          <div>
            <Text variant="h3" className="text-text mb-1 font-semibold">Notification Preferences</Text>
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
                onChange={onToggleEmailPromo}
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
                onChange={onToggleSmsAlerts}
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
                onChange={onTogglePushAlerts}
                aria-label="Toggle Desktop Push Alerts"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-8">
          <div className="space-y-6 max-w-lg">
            <div>
              <Text variant="h3" className="text-text mb-1 font-semibold">Discoverability Settings</Text>
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
                  onChange={onTogglePublicProfile}
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
                  onChange={onToggleRecruitersOnly}
                  aria-label="Toggle Visible to Recruiters Only"
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-4 max-w-lg">
            <div>
              <Text variant="h3" className="text-error mb-1 font-semibold">Deactivate or Delete Account</Text>
              <Text variant="body-sm" color="muted">Permanently delete your profile, documents, and historical data.</Text>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-error/20 bg-error-bg/20">
              <div className="space-y-0.5">
                <Text variant="body-sm" weight="semibold" className="text-text">Delete Profile Permanently</Text>
                <Text variant="caption" color="muted">This action is irreversible and erases all records.</Text>
              </div>
              <Button
                variant="danger"
                onClick={onOpenDelete}
                leftIcon={<Trash2 size={16} />}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
