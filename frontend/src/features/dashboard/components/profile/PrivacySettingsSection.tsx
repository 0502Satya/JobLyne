"use client";

import React from "react";
import { PrivacySettings } from "@/types/profile";

interface PrivacySettingsSectionProps {
  privacySettings: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
}

export default function PrivacySettingsSection({ privacySettings, onChange }: PrivacySettingsSectionProps) {
  const settings = privacySettings || {
    public_profile: true,
    visible_to_recruiters_only: false,
    hide_current_company: false,
    anonymous_applications: false,
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    const updated: PrivacySettings = {
      ...settings,
      [key]: !settings[key],
    };
    onChange(updated);
  };

  const options: {
    key: keyof PrivacySettings;
    title: string;
    description: string;
    icon: string;
  }[] = [
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

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="privacy">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">shield</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Recruiter Visibility & Privacy</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Manage your profile discoverability settings</p>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 bg-card space-y-5">
        <div className="space-y-4">
          {options.map((opt) => {
            const isActive = !!settings[opt.key];
            return (
              <div
                key={opt.key}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40 hover:bg-bg/80 transition-all gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text tracking-tight mb-0.5">{opt.title}</h4>
                    <p className="text-xs text-muted leading-normal font-medium">{opt.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(opt.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 min-h-[44px] cursor-pointer ${
                    isActive ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isActive ? "right-0.5" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

