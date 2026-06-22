"use client";

import React, { useState } from "react";
import { Profile } from "@/types/profile";
import { Button } from "@/shared/ui";
import { BarChart3, Info, Sparkles, Printer, Eye } from "lucide-react";

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
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="resume">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Resume Builder & Strength</h3>
            <p className="text-xs text-muted mt-0.5">Auto-generate and optimize your CV</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-primary border border-primary/20 px-2.5 rounded-full py-0.5 type-caption bg-primary/10">
            Strength: {profileStrength}%
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-card p-5 space-y-6 sm:p-6 text-left">
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-[1fr_240px]">
          {/* Templates Selection & Resume Details */}
          <div className="min-w-0 space-y-5">
            <div className="border-border bg-bg/40 p-4 rounded-xl border">
              <h4 className="mb-2.5 uppercase tracking-wider type-caption text-muted">Select Template</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "classic", label: "Classic", color: "bg-slate-700" },
                  { id: "modern", label: "Modern", color: "bg-primary" },
                  { id: "minimal", label: "Minimalist", color: "bg-slate-500" },
                ].map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    type="button"
                    variant={template === tmpl.id ? "outline" : "ghost"}
                    className={`h-auto p-2.5 flex flex-col items-center justify-center ${
                      template === tmpl.id
                        ? "border-primary! ring-2 ring-primary/20 bg-card!"
                        : "border-transparent"
                    }`}
                  >
                    <div className={`mb-1.5 h-10 w-8 shadow-inner rounded ${tmpl.color} text-xs justify-center opacity-80 items-center text-white flex`}>
                      CV
                    </div>
                    <span className="text-text text-xs font-normal">{tmpl.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="uppercase tracking-wider type-caption text-muted">Optimization Recommendations</h4>
              <div className="space-y-2">
                {(!profile?.skills || profile.skills.length < 5) && (
                  <div className="border-amber-500/10 text-amber-600 items-start p-3 gap-2 rounded-lg flex bg-amber-500/5 type-caption border dark:text-amber-400">
                    <Info size={14} className="mt-0.5" aria-hidden="true" />
                    Add at least 5 skills to showcase your core competencies.
                  </div>
                )}
                {(!profile?.experience || profile.experience.length === 0) && (
                  <div className="border-amber-500/10 text-amber-600 items-start p-3 gap-2 rounded-lg flex bg-amber-500/5 type-caption border dark:text-amber-400">
                    <Info size={14} className="mt-0.5" aria-hidden="true" />
                    Add work experience records to highlight your career history.
                  </div>
                )}
                {profileStrength >= 80 && (
                  <div className="bg-emerald-500/5 border-emerald-500/10 text-emerald-600 items-start p-3 gap-2 rounded-lg flex type-caption border dark:text-emerald-450">
                    <Sparkles size={14} className="mt-0.5" aria-hidden="true" />
                    Looking good! Your profile has excellent detail and strength.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Widgets */}
          <div className="border-t border-border/60 flex-col pt-5 flex gap-5 justify-between lg:pl-5 lg:border-t-0 lg:pt-0 lg:border-l">
            <div className="space-y-2">
              <h4 className="uppercase tracking-wider type-caption text-muted">Actions</h4>
              <Button
                onClick={handleDownloadPDF}
                type="button"
                variant="primary"
                className="w-full justify-center gap-1.5 min-h-[44px]"
              >
                <Printer size={14} aria-hidden="true" />
                Print / Save PDF
              </Button>
              <Button
                onClick={handleLivePreview}
                type="button"
                variant="outline"
                className="w-full justify-center gap-1.5 min-h-[44px]"
              >
                <Eye size={14} aria-hidden="true" />
                Live Preview
              </Button>
            </div>

            <div className="border-border p-3.5 leading-relaxed rounded-lg bg-bg/40 type-caption text-muted border">
              <span className="text-text mb-0.5 block uppercase">Print Tip</span>
              Use the browser print window to save as PDF. Ensure &quot;Background graphics&quot; is checked in print settings.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

