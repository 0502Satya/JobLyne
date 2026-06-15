"use client";

import React, { useState } from "react";
import { Profile } from "@/types/profile";

interface ResumeBuilderSectionProps {
  profile: Profile | null;
  onChange: <K extends keyof Profile>(field: K, value: Profile[K]) => void;
}

export default function ResumeBuilderSection({ profile, onChange }: ResumeBuilderSectionProps) {
  const [template, setTemplate] = useState("classic");

  // Calculate simulated Profile Strength score based on profile completion with no baseline floor (starts at 0%)
  const getProfileStrengthScore = () => {
    let score = 0;
    if (profile?.bio) score += 20;
    if (profile?.experience && profile.experience.length > 0) score += 25;
    if (profile?.education && profile.education.length > 0) score += 20;
    if (profile?.skills && profile.skills.length >= 5) score += 20;
    if (profile?.resume_file_url) score += 15;
    return Math.min(score, 100);
  };

  const profileStrength = getProfileStrengthScore();

  const handleDownloadPDF = () => {
    window.open("/dashboard/resume-preview?print=true", "_blank");
  };

  const handleLivePreview = () => {
    window.open("/dashboard/resume-preview", "_blank");
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="resume">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">analytics</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Resume Builder & Strength</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Auto-generate and optimize your CV</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
            Strength: {profileStrength}%
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
          {/* Templates Selection & Resume Details */}
          <div className="space-y-5 min-w-0">
            <div className="bg-bg/40 border border-border rounded-xl p-4">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5">Select Template</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "classic", label: "Classic", color: "bg-slate-700" },
                  { id: "modern", label: "Modern", color: "bg-primary" },
                  { id: "minimal", label: "Minimalist", color: "bg-slate-500" },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    type="button"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                      template === tmpl.id
                        ? "border-primary bg-card shadow-xs"
                        : "border-transparent bg-bg hover:bg-bg/80"
                    }`}
                  >
                    <div className={`w-8 h-10 rounded shadow-inner mb-1.5 ${tmpl.color} opacity-80 flex items-center justify-center text-white text-[8px] font-bold`}>
                      CV
                    </div>
                    <span className="text-[11px] font-semibold text-text">{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Optimization Recommendations</h4>
              <div className="space-y-2">
                {(!profile?.skills || profile.skills.length < 5) && (
                  <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                    Add at least 5 skills to showcase your core competencies.
                  </div>
                )}
                {(!profile?.experience || profile.experience.length === 0) && (
                  <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                    Add work experience records to highlight your career history.
                  </div>
                )}
                {profileStrength >= 80 && (
                  <div className="flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-450 font-semibold bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                    <span className="material-symbols-outlined text-sm mt-0.5">stars</span>
                    Looking good! Your profile has excellent detail and strength.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Widgets */}
          <div className="flex flex-col justify-between gap-5 border-t lg:border-t-0 lg:border-l border-border/60 pt-5 lg:pt-0 lg:pl-5">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Actions</h4>
              <button
                onClick={handleDownloadPDF}
                type="button"
                className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print / Save PDF
              </button>
              <button
                onClick={handleLivePreview}
                type="button"
                className="w-full py-2.5 bg-card text-text border border-border font-bold text-xs rounded-lg hover:bg-bg transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Live Preview
              </button>
            </div>

            <div className="bg-bg/40 p-3.5 rounded-lg text-xs text-muted font-medium leading-relaxed border border-border">
              <span className="font-bold text-text uppercase block mb-0.5">Print Tip</span>
              Use the browser print window to save as PDF. Ensure &quot;Background graphics&quot; is checked in print settings.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

