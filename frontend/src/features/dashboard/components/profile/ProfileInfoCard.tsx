"use client";

import React from "react";
import { Profile } from "@/types/profile";
import { Button } from "@/shared/ui";
import { BadgeCheck, MapPin, BriefcaseBusiness, FileText, Download, Pencil } from "lucide-react";

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
    <div className="border-border rounded-2xl relative overflow-hidden shadow-sm bg-card mb-6 border">
      <div className="w-full border-b border-border relative overflow-hidden bg-primary h-28 sm:h-32">
        <div className="inset-0 absolute bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))]" />
        <div className="bg-white/10 text-xs backdrop-blur text-white/95 uppercase absolute hidden items-center px-3 gap-2 rounded-lg tracking-wide right-6 py-1.5 top-5 sm:flex dark:bg-black/20">
          <BadgeCheck size={14} aria-hidden="true" />
          Candidate profile
        </div>
      </div>

      <div className="pb-6 relative px-6 sm:px-8 sm:pb-8">
        <div className="items-center flex-col flex gap-5 mt-[-40px] justify-between md:items-start md:flex-row md:mt-[-48px]">
          <div className="gap-4 items-center text-center flex min-w-0 flex-col md:items-start md:flex-row md:text-left lg:gap-6">
            <div className="shrink-0 w-24 shadow-md border-border relative overflow-hidden p-1 rounded-full bg-card h-24 border sm:w-28 sm:h-28">
              <div className="w-full justify-center h-full overflow-hidden items-center bg-bg rounded-full flex">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full justify-center h-full text-3xl weight-display items-center text-white bg-primary flex shadow-inner">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 min-w-0 md:pt-12">
              <div className="justify-center gap-1.5 items-center flex-wrap flex mb-1 md:justify-start">
                <h1 className="text-text break-words type-h2">{profile?.full_name || "Alex Thompson"}</h1>
                <span title="Verified profile">
                  <BadgeCheck size={18} className="text-primary" aria-hidden="true" />
                </span>
              </div>
              <p className="break-words text-text/80 mb-3 type-ui">
                {profile?.headline || profile?.current_designation || "Add a professional headline"}
              </p>

              <div className="justify-center gap-y-2 gap-x-4 items-center flex-wrap flex type-caption text-muted md:justify-start">
                {profile?.location && (
                  <div className="gap-1 flex items-center">
                    <MapPin size={14} className="text-muted/80" aria-hidden="true" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="gap-1 flex items-center">
                  <BriefcaseBusiness size={14} className="text-muted/80" aria-hidden="true" />
                  <span>{profile?.experience_years ? `${profile.experience_years} yrs experience` : "Fresher"}</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="h-2 shrink-0 w-2 rounded-full bg-success"></span>
                  <span>
                    {profile?.work_mode && Array.isArray(profile.work_mode) && profile.work_mode.length > 0
                      ? `Open to ${profile.work_mode.join(" & ").toLowerCase()}`
                      : profile?.work_mode && typeof profile.work_mode === "string"
                        ? `Open to ${profile.work_mode.toLowerCase()}`
                        : "Open to remote & hybrid"}
                  </span>
                </div>
              </div>

              <div className="justify-center gap-2 flex-wrap flex mt-4 md:justify-start">
                {(profile?.skills || []).slice(0, 4).map((skill) => (
                  <span key={skill} className="text-primary h-7 inline-flex px-3 items-center rounded-lg type-caption bg-primary/10 dark:bg-primary/20">
                    {skill}
                  </span>
                ))}
                {profile?.resume_file_url && (
                  <span className="h-7 gap-1 inline-flex text-success px-3 items-center rounded-lg bg-success-bg type-caption">
                    <FileText size={14} aria-hidden="true" />
                    Resume ready
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full justify-center shrink-0 gap-2.5 flex pt-0 md:w-auto md:pt-12">
            <Button
              onClick={handleDownloadResume}
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none"
            >
              <Download size={14} aria-hidden="true" />
              Resume
            </Button>
            <Button
              onClick={onEdit}
              variant="primary"
              size="sm"
              className="flex-1 md:flex-none"
            >
              <Pencil size={14} aria-hidden="true" />
              Edit profile
            </Button>
          </div>
        </div>

        {(profile?.bio || profile?.summary) && (
          <div className="border-t break-words border-border type-label mt-6 leading-relaxed pt-5">
            {profile.bio || profile.summary}
          </div>
        )}
      </div>
    </div>
  );
}
