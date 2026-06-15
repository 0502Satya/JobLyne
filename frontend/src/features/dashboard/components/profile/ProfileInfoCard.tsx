"use client";

import React from "react";
import { Profile } from "@/types/profile";

interface ProfileInfoCardProps {
  profile: Profile | null;
  onEdit: () => void;
}

export default function ProfileInfoCard({ profile, onEdit }: ProfileInfoCardProps) {
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : "NA";

  const handleDownloadResume = () => {
    if (profile?.resume_file_url) {
      window.open(profile.resume_file_url, "_blank");
    } else {
      alert("No resume file uploaded yet.");
    }
  };

  return (
    <div className="relative bg-card rounded-2xl shadow-sm mb-6 overflow-hidden border border-border">
      <div className="h-28 sm:h-32 bg-primary relative w-full border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),linear-gradient(135deg,rgb(var(--color-primary)),#084b51)]" />
        <div className="absolute right-6 top-5 hidden sm:flex items-center gap-2 rounded-lg bg-white/10 dark:bg-black/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white/95 backdrop-blur">
          <span className="material-symbols-outlined text-sm">verified</span>
          Candidate profile
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-5 mt-[-40px] md:mt-[-48px]">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 lg:gap-6 min-w-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-card p-1 shadow-md overflow-hidden shrink-0 border border-border">
              <div className="w-full h-full rounded-full bg-bg flex items-center justify-center overflow-hidden">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-extrabold shadow-inner">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 md:pt-12 min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight break-words">{profile?.full_name || "Alex Thompson"}</h1>
                <span className="material-symbols-outlined text-primary text-lg font-black" title="Verified Profile">verified</span>
              </div>
              <p className="text-sm font-semibold text-text/80 mb-3 break-words">
                {profile?.headline || profile?.current_designation || "Add a professional headline"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-muted">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-muted/80">location_on</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-muted/80">work_history</span>
                  <span>{profile?.experience_years ? `${profile.experience_years} yrs experience` : "Fresher"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>
                    {profile?.work_mode && Array.isArray(profile.work_mode) && profile.work_mode.length > 0
                      ? `Open to ${profile.work_mode.join(" & ").toLowerCase()}`
                      : profile?.work_mode && typeof profile.work_mode === "string"
                        ? `Open to ${profile.work_mode.toLowerCase()}`
                        : "Open to remote & hybrid"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                {(profile?.skills || []).slice(0, 4).map((skill) => (
                  <span key={skill} className="inline-flex h-7 items-center rounded-lg bg-primary/10 dark:bg-primary/20 px-3 text-xs font-bold text-primary">
                    {skill}
                  </span>
                ))}
                {profile?.resume_file_url && (
                  <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-sm">description</span>
                    Resume ready
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-0 md:pt-12 w-full md:w-auto shrink-0 justify-center">
            <button
              onClick={handleDownloadResume}
              className="flex-1 md:flex-none px-4 py-2.5 bg-card text-text font-bold text-xs rounded-lg border border-border hover:bg-bg transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Resume
            </button>
            <button
              onClick={onEdit}
              className="flex-1 md:flex-none px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit profile
            </button>
          </div>
        </div>

        {(profile?.bio || profile?.summary) && (
          <div className="mt-6 pt-5 border-t border-border text-sm text-muted leading-relaxed font-medium break-words">
            {profile.bio || profile.summary}
          </div>
        )}
      </div>
    </div>
  );
}
