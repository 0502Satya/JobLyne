"use client";

import React from "react";
import { PrivacySettings } from "@/types/profile";
import { Shield } from "lucide-react";
import Icon from "@/shared/ui/Icon";

interface PrivacySettingsSectionProps {
  privacySettings: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  public_profile: true,
  visible_to_recruiters_only: false,
  hide_current_company: false,
  anonymous_applications: false,
};

const OPTIONS: { key: keyof PrivacySettings; title: string; description: string; icon: string }[] = [
  {
    key: "public_profile",
    title: "Public Profile",
    description: "Allow anyone on the internet to view your professional credentials.",
    icon: "public",
  },
  {
    key: "visible_to_recruiters_only",
    title: "Visible to Recruiters Only",
    description: "Hide your profile from search engines and non-recruiter user accounts.",
    icon: "admin_panel_settings",
  },
  {
    key: "hide_current_company",
    title: "Hide Current Company",
    description: "Prevent your current employer from seeing your job search profile.",
    icon: "domain_disabled",
  },
  {
    key: "anonymous_applications",
    title: "Anonymous Applications",
    description: "Submit applications showing details without name/photo until selected.",
    icon: "visibility_off",
  },
];

export default function PrivacySettingsSection({ privacySettings, onChange }: PrivacySettingsSectionProps) {
  // Merge with defaults so missing keys still have a sensible value
  const settings: PrivacySettings = { ...DEFAULT_SETTINGS, ...privacySettings };

  const handleToggle = (key: keyof PrivacySettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="privacy">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Shield size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Recruiter Visibility &amp; Privacy</h3>
            <p className="text-xs text-muted mt-0.5">Manage your profile discoverability settings</p>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-card space-y-3 p-5 sm:p-6">
        {OPTIONS.map((opt) => {
          const isActive = !!settings[opt.key];
          return (
            <div
              key={opt.key}
              className="border border-border gap-4 items-center transition-colors bg-bg/40 flex p-4 rounded-xl justify-between hover:bg-bg/80"
            >
              {/* Icon + Text */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="justify-center w-9 shrink-0 border-border items-center rounded-lg shadow-xs bg-card flex h-9 text-muted border">
                  <Icon name={opt.icon} size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-text mb-0.5 tracking-tight type-ui">{opt.title}</h4>
                  <p className="type-caption text-muted leading-normal">{opt.description}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                aria-label={opt.title}
                onClick={() => handleToggle(opt.key)}
                className="flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full cursor-pointer"
              >
                {/* Track */}
                <span
                  className={`flex items-center w-11 h-6 rounded-full transition-colors duration-200 px-0.5 ${
                    isActive ? "bg-primary" : "bg-border"
                  }`}
                >
                  {/* Thumb */}
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
