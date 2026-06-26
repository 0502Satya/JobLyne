"use client";

import React, { useState, useRef } from "react";
import { Dialog, Button } from "@/shared/ui";
import { Profile } from "@/types/profile";
import { User, Check, Pencil, Camera, FileUp, CheckCircle2, Link as LinkIcon, Briefcase, Code2 } from "lucide-react";

interface PersonalInfoSectionProps {
  profile: Profile | null;
  onChange: <K extends keyof Profile>(field: K, value: Profile[K]) => void;
}

export default function PersonalInfoSection({ profile, onChange }: PersonalInfoSectionProps) {
  // Crop Tool Modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);

  // Resume state
  const [resumeFile, setResumeFile] = useState<string | null>(profile?.resume_file_url ? "Resume uploaded" : null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Photo Crop/Zoom Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setTempPhotoUrl(url);
      setShowCropModal(true);
    }
  };

  const handleApplyCrop = () => {
    if (tempPhotoUrl) {
      onChange("profile_photo_url", tempPhotoUrl);
      setShowCropModal(false);
    }
  };

  // Resume drag & drop
  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResume(e.dataTransfer.files[0]);
    }
  };

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processResume(e.target.files[0]);
    }
  };

  const processResume = (file: File) => {
    setIsParsing(true);
    setParsingProgress(10);
    const interval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsParsing(false);
          setResumeFile(file.name);
          onChange("resume_file_url", URL.createObjectURL(file));
          // Pre-populate professional headline from file name as helper
          if (!profile?.headline) {
            onChange("headline", `${file.name.replace(/\.[^/.]+$/, "")} Expert`);
          }
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const isComplete = !!(profile?.first_name && profile?.last_name && profile?.email && profile?.phone);

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="personal">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <User size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Personal Details & Resume</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Your professional contact and identity details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 min-h-[40px]"
          >
            {isEditing ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Pencil size={16} aria-hidden="true" />
            )}
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8">
          {/* Left Column: Photo & Resume Drop */}
          <div className="flex flex-col items-center gap-6">
            {/* Profile Photo */}
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-border shadow-xs bg-bg flex items-center justify-center">
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={32} className="text-muted/60" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer"
              >
                <Pencil size={16} className="mb-1" aria-hidden="true" />
                Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Resume Upload Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleResumeDrop}
              className="w-full border border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 text-center cursor-pointer bg-bg/50 hover:bg-bg/90"
              onClick={() => resumeInputRef.current?.click()}
            >
              <FileUp size={24} className="text-primary/80 mx-auto mb-1 block" aria-hidden="true" />
              <span className="text-xs font-semibold text-text block mb-0.5">Drag Resume Here</span>
              <span className="text-[10px] text-muted block">PDF, DOC or DOCX (Max 5MB)</span>
              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeFileSelect}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              {isParsing && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-wide">
                    <span>Parsing...</span>
                    <span>{parsingProgress}%</span>
                  </div>
                  <div className="w-full bg-border h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-350" style={{ width: `${parsingProgress}%` }}></div>
                  </div>
                </div>
              )}
              {resumeFile && !isParsing && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-success bg-success-bg py-1.5 px-2 rounded-lg border border-success/20 truncate">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  <span className="truncate">{resumeFile}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details Info Form or Readonly View */}
          <div className="min-w-0">
            {isEditing ? (
              /* EDIT MODE */
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">First name</label>
                    <input
                      type="text"
                      value={profile?.first_name || ""}
                      onChange={(e) => onChange("first_name", e.target.value)}
                      placeholder="John"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Middle Name</label>
                    <input
                      type="text"
                      value={profile?.middle_name || ""}
                      onChange={(e) => onChange("middle_name", e.target.value)}
                      placeholder="David"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={profile?.last_name || ""}
                      onChange={(e) => onChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Professional Headline</label>
                  <input
                    type="text"
                    value={profile?.headline || ""}
                    onChange={(e) => onChange("headline", e.target.value)}
                    placeholder="e.g. Senior Frontend Architect | React & TypeScript specialist"
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile?.email || ""}
                        onChange={(e) => onChange("email", e.target.value)}
                        placeholder="john.doe@example.com"
                        className="w-full pl-3.5 pr-20 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                      />
                      <span className="absolute right-2 top-1.5 px-2 py-0.5 bg-success-bg text-success text-[10px] font-bold rounded border border-success/20 flex items-center gap-1">
                        <CheckCircle2 size={12} aria-hidden="true" /> Verified
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile?.phone || ""}
                        onChange={(e) => onChange("phone", e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-3.5 pr-20 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                      />
                      <span className="absolute right-2 top-1.5 px-2 py-0.5 bg-success-bg text-success text-[10px] font-bold rounded border border-success/20 flex items-center gap-1">
                        <CheckCircle2 size={12} aria-hidden="true" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Date of birth</label>
                    <input
                      type="date"
                      value={profile?.date_of_birth || ""}
                      onChange={(e) => onChange("date_of_birth", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Gender</label>
                    <select
                      value={profile?.gender || ""}
                      onChange={(e) => onChange("gender", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Nationality</label>
                    <input
                      type="text"
                      value={profile?.nationality || ""}
                      onChange={(e) => onChange("nationality", e.target.value)}
                      placeholder="Canadian"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Current Location</label>
                    <input
                      type="text"
                      value={profile?.location || ""}
                      onChange={(e) => onChange("location", e.target.value)}
                      placeholder="Vancouver, BC"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Hometown</label>
                    <input
                      type="text"
                      value={profile?.hometown || ""}
                      onChange={(e) => onChange("hometown", e.target.value)}
                      placeholder="Toronto"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Pincode</label>
                    <input
                      type="text"
                      value={profile?.pincode || ""}
                      onChange={(e) => onChange("pincode", e.target.value)}
                      placeholder="V6B 1A1"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Websites and portfolios</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Portfolio</label>
                      <input
                        type="text"
                        value={profile?.social_links?.portfolio || ""}
                        onChange={(e) => {
                          const links = { ...(profile?.social_links || {}), portfolio: e.target.value };
                          onChange("social_links", links);
                        }}
                        placeholder="https://johndoe.dev"
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={profile?.social_links?.linkedin || ""}
                        onChange={(e) => {
                          const links = { ...(profile?.social_links || {}), linkedin: e.target.value };
                          onChange("social_links", links);
                        }}
                        placeholder="https://linkedin.com/in/johndoe"
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">GitHub</label>
                      <input
                        type="text"
                        value={profile?.social_links?.github || ""}
                        onChange={(e) => {
                          const links = { ...(profile?.social_links || {}), github: e.target.value };
                          onChange("social_links", links);
                        }}
                        placeholder="https://github.com/johndoe"
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* READONLY VIEW MODE */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">First name</span>
                  <span className="font-semibold text-text">{profile?.first_name || "Not specified"}</span>
                </div>
                {profile?.middle_name && (
                  <div>
                    <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Middle Name</span>
                    <span className="font-semibold text-text">{profile.middle_name}</span>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Last name</span>
                  <span className="font-semibold text-text">{profile?.last_name || "Not specified"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Professional Headline</span>
                  <span className="font-semibold text-text break-words block">{profile?.headline || "Not specified"}</span>
                </div>
                 <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Email Address</span>
                  <span className="font-semibold text-text flex items-center gap-1.5">
                    {profile?.email || "Not specified"}
                    {profile?.email && (
                      <span title="Verified">
                        <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Phone Number</span>
                  <span className="font-semibold text-text flex items-center gap-1.5">
                    {profile?.phone || "Not specified"}
                    {profile?.phone && (
                      <span title="Verified">
                        <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Date of birth</span>
                  <span className="font-semibold text-text">{profile?.date_of_birth || "Not specified"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Gender</span>
                  <span className="font-semibold text-text">{profile?.gender || "Not specified"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Nationality</span>
                  <span className="font-semibold text-text">{profile?.nationality || "Not specified"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Current Location</span>
                  <span className="font-semibold text-text">{profile?.location || "Not specified"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Hometown</span>
                  <span className="font-semibold text-text">{profile?.hometown || "Not specified"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Pincode</span>
                  <span className="font-semibold text-text">{profile?.pincode || "Not specified"}</span>
                </div>

                {/* Websites and portfolios Row */}
                <div className="md:col-span-2 lg:col-span-3 pt-5 border-t border-border/60">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">Websites and portfolios</span>
                  <div className="flex flex-wrap gap-3">
                     {profile?.social_links?.portfolio && (
                      <a
                        href={profile.social_links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-bg border border-border text-xs font-bold text-primary rounded-xl hover:bg-bg/80 hover:shadow-xs transition-all"
                      >
                        <LinkIcon size={14} aria-hidden="true" />
                        Portfolio Website
                      </a>
                    )}
                    {profile?.social_links?.linkedin && (
                      <a
                        href={profile.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-bg border border-border text-xs font-bold text-linkedin rounded-xl hover:bg-bg/80 hover:shadow-xs transition-all"
                      >
                        <Briefcase size={14} aria-hidden="true" />
                        LinkedIn Profile
                      </a>
                    )}
                    {profile?.social_links?.github && (
                      <a
                        href={profile.social_links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-bg border border-border text-xs font-bold text-text rounded-xl hover:bg-bg/80 hover:shadow-xs transition-all"
                      >
                        <Code2 size={14} aria-hidden="true" />
                        GitHub Profile
                      </a>
                    )}
                    {!profile?.social_links?.portfolio && !profile?.social_links?.linkedin && !profile?.social_links?.github && (
                      <span className="text-xs text-muted italic">No websites or social profiles linked yet.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <Dialog
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        title="Adjust Profile Picture"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCropModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplyCrop}
              className="flex-1"
            >
              Apply Crop
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-muted mb-4 font-display">Position and zoom your photo to look your best.</p>

          {/* Cropper viewport mock */}
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-bg border border-border flex items-center justify-center relative">
            <div className="absolute inset-4 rounded-full border border-white/80 border-dashed z-10 pointer-events-none shadow-[0_0_0_9999px_var(--color-overlay-dark)]"></div>
            {tempPhotoUrl && (
              <img
                src={tempPhotoUrl}
                alt="Crop preview"
                className="max-w-none transition-transform"
                style={{
                  transform: `scale(${cropZoom}) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted uppercase">
              <span>Zoom</span>
              <span>{cropZoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={cropZoom}
              onChange={(e) => setCropZoom(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </Dialog>
    </section>
  );
}
