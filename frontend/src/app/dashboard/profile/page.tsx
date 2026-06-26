"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { getCandidateProfileAction, updateCandidateProfileAction } from "@/features/auth/actions";
import PersonalInfoSection from "@/features/dashboard/components/profile/PersonalInfoSection";
import LanguagesSection from "@/features/dashboard/components/profile/LanguagesSection";
import AboutMeSection from "@/features/dashboard/components/profile/AboutMeSection";
import JobPreferencesSection from "@/features/dashboard/components/profile/JobPreferencesSection";
import WorkExperienceSection from "@/features/dashboard/components/profile/WorkExperienceSection";
import EducationSection from "@/features/dashboard/components/profile/EducationSection";
import SkillsSection from "@/features/dashboard/components/profile/SkillsSection";
import ProjectsSection from "@/features/dashboard/components/profile/ProjectsSection";
import CertificationsSection from "@/features/dashboard/components/profile/CertificationsSection";
import PrivacySettingsSection from "@/features/dashboard/components/profile/PrivacySettingsSection";
import { toast } from "react-hot-toast";
import ProfileInfoCard from "@/features/dashboard/components/profile/ProfileInfoCard";
import { Button, ErrorState, Icon } from "@/shared/ui";
import {
  CheckCircle2,
  Network,
  Sparkles
} from "lucide-react";

import { Profile } from "@/types/profile";

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: "person" },
  { id: "languages", label: "Languages", icon: "language" },
  { id: "about", label: "About Me", icon: "description" },
  { id: "preferences", label: "Preferences", icon: "tune" },
  { id: "experience", label: "Experience", icon: "work" },
  { id: "education", label: "Education", icon: "school" },
  { id: "skills", label: "Skills", icon: "bolt" },
  { id: "projects", label: "Projects", icon: "folder_open" },
  { id: "certifications", label: "Certifications", icon: "workspace_premium" },
  { id: "privacy", label: "Privacy Settings", icon: "shield" },
];

function isProfileDirty(a: Profile | null, b: Profile | null): boolean {
  if (a === b) return false;
  if (!a || !b) return true;

  // Key primitive fields to check first (shallow check)
  const primitiveKeys: (keyof Profile)[] = [
    "id", "full_name", "first_name", "middle_name", "last_name", "username",
    "email", "phone", "whatsapp_number", "location", "city", "country",
    "hometown", "pincode", "headline", "bio", "summary", "experience_years",
    "notice_period", "expected_salary", "current_salary", "currency",
    "resume_file_url", "gender", "date_of_birth", "marital_status",
    "current_company", "current_designation", "industry", "functional_area",
    "is_open_to_opportunities", "desired_titles", "completeness",
    "profile_photo_url", "member_since", "nationality", "preferred_company_size",
    "open_to_relocation", "open_to_international"
  ];

  for (const key of primitiveKeys) {
    if (a[key] !== b[key]) {
      return true;
    }
  }

  // Complex fields (deep check using stringify)
  const complexKeys: (keyof Profile)[] = [
    "work_mode", "preferred_locations", "social_links", "experience",
    "education", "projects", "certifications", "skills", "languages",
    "privacy_settings"
  ];

  for (const key of complexKeys) {
    const valA = a[key];
    const valB = b[key];
    if (JSON.stringify(valA) !== JSON.stringify(valB)) {
      return true;
    }
  }

  return false;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const dirtyCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initials = useMemo(() => {
    return profile?.full_name
      ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
      : "AL";
  }, [profile?.full_name]);

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  async function fetchProfile() {
    setLoading(true);
    setFetchError(false);
    const data = await getCandidateProfileAction();
    if (!data.error) {
      // Pre-populate first_name and last_name from full_name if empty
      if (data.full_name && !data.first_name && !data.last_name) {
        const parts = data.full_name.trim().split(/\s+/);
        data.first_name = parts[0] || "";
        data.last_name = parts.slice(1).join(" ") || "";
      }
      setProfile(data);
      setOriginalProfile(structuredClone(data));
    } else {
      setFetchError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  // Scrollspy logic to highlight active sidebar item using IntersectionObserver
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  const handleChange = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated: Profile = { ...prev, [field]: value };

      if (field === "first_name" || field === "middle_name" || field === "last_name") {
        const fname = field === "first_name" ? (value as string) : (prev.first_name || "");
        const mname = field === "middle_name" ? (value as string) : (prev.middle_name || "");
        const lname = field === "last_name" ? (value as string) : (prev.last_name || "");
        updated.full_name = [fname, mname, lname].filter(Boolean).join(" ");
      }
      return updated;
    });
  };

  const activeVisibility = useMemo(() => {
    const settings = profile?.privacy_settings || {};
    if (settings.public_profile === true) {
      return "everyone";
    } else if (settings.visible_to_recruiters_only === true) {
      return "recruiters";
    } else {
      return "hidden";
    }
  }, [profile?.privacy_settings]);

  const handleVisibilityChange = (option: "everyone" | "recruiters" | "hidden") => {
    const currentSettings = profile?.privacy_settings || {};
    const updatedSettings = { ...currentSettings };
    if (option === "everyone") {
      updatedSettings.public_profile = true;
      updatedSettings.visible_to_recruiters_only = false;
    } else if (option === "recruiters") {
      updatedSettings.public_profile = false;
      updatedSettings.visible_to_recruiters_only = true;
    } else {
      updatedSettings.public_profile = false;
      updatedSettings.visible_to_recruiters_only = false;
    }
    handleChange("privacy_settings", updatedSettings);
  };


  // Debounced dirty state checker to avoid lags during rapid typing
  useEffect(() => {
    if (dirtyCheckTimerRef.current) {
      clearTimeout(dirtyCheckTimerRef.current);
    }
    dirtyCheckTimerRef.current = setTimeout(() => {
      setHasUnsavedChanges(isProfileDirty(profile, originalProfile));
    }, 300);
    return () => {
      if (dirtyCheckTimerRef.current) {
        clearTimeout(dirtyCheckTimerRef.current);
      }
    };
  }, [profile, originalProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const result = await updateCandidateProfileAction(profile);
    if (result.success) {
      setOriginalProfile(structuredClone(profile));
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to save profile");
    }
    setIsSaving(false);
  };

  const handleDiscard = () => {
    if (originalProfile) {
      setProfile(structuredClone(originalProfile));
      setHasUnsavedChanges(false);
      toast.success("Changes discarded");
    }
  };

  // Memoized section statuses
  const sectionStatuses = useMemo(() => {
    const getStatus = (id: string): { status: "complete" | "partial" | "empty"; error: boolean } => {
      if (!profile) return { status: "empty", error: false };
      switch (id) {
        case "personal": {
          const hasRequired = !!(profile.first_name && profile.last_name && profile.email && profile.phone);
          const hasAny = !!(
            profile.first_name ||
            profile.middle_name ||
            profile.last_name ||
            profile.email ||
            profile.phone ||
            profile.whatsapp_number ||
            profile.location ||
            profile.city ||
            profile.country ||
            profile.hometown ||
            profile.pincode
          );
          if (hasRequired) return { status: "complete", error: false };
          if (hasAny) return { status: "partial", error: true };
          return { status: "empty", error: true };
        }
        case "languages": {
          const hasLanguages = !!(profile.languages && profile.languages.length > 0);
          if (hasLanguages) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        case "about": {
          const bioLen = profile.bio?.length || 0;
          if (bioLen >= 80) return { status: "complete", error: false };
          if (bioLen > 0) return { status: "partial", error: false };
          return { status: "empty", error: false };
        }
        case "preferences": {
          const hasRequired = !!(profile.desired_titles && profile.expected_salary);
          const hasAny = !!(
            profile.desired_titles ||
            profile.expected_salary ||
            profile.functional_area ||
            profile.industry ||
            profile.notice_period ||
            profile.preferred_locations ||
            profile.work_mode
          );
          if (hasRequired) return { status: "complete", error: false };
          if (hasAny) return { status: "partial", error: false };
          return { status: "empty", error: false };
        }
        case "experience": {
          const hasEntries = !!(profile.experience && profile.experience.length > 0);
          const started = !!profile.experience_years;
          if (hasEntries) return { status: "complete", error: false };
          if (started) return { status: "partial", error: false };
          return { status: "empty", error: false };
        }
        case "education": {
          const hasEntries = !!(profile.education && profile.education.length > 0);
          if (hasEntries) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        case "skills": {
          const skillsCount = profile.skills?.length || 0;
          if (skillsCount >= 3) return { status: "complete", error: false };
          if (skillsCount > 0) return { status: "partial", error: false };
          return { status: "empty", error: false };
        }
        case "projects": {
          const hasEntries = !!(profile.projects && profile.projects.length > 0);
          if (hasEntries) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        case "certifications": {
          const hasEntries = !!(profile.certifications && profile.certifications.length > 0);
          if (hasEntries) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        case "resume": {
          const hasResume = !!profile.resume_file_url;
          if (hasResume) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        case "privacy": {
          const hasPrivacy = !!profile.privacy_settings;
          if (hasPrivacy) return { status: "complete", error: false };
          return { status: "empty", error: false };
        }
        default:
          return { status: "empty", error: false };
      }
    };

    const statuses: Record<string, { status: "complete" | "partial" | "empty"; error: boolean }> = {};
    SECTIONS.forEach((sect) => {
      statuses[sect.id] = getStatus(sect.id);
    });
    return statuses;
  }, [profile]);

  // Calculate completeness percentage using weighted logic
  const completenessScore = useMemo(() => {
    let score = 0;
    if (sectionStatuses["personal"]?.status === "complete") score += 15;
    else if (sectionStatuses["personal"]?.status === "partial") score += 8;

    if (sectionStatuses["languages"]?.status === "complete") score += 5;

    if (sectionStatuses["about"]?.status === "complete") score += 5;
    else if (sectionStatuses["about"]?.status === "partial") score += 2;

    if (sectionStatuses["preferences"]?.status === "complete") score += 5;
    else if (sectionStatuses["preferences"]?.status === "partial") score += 2;

    if (sectionStatuses["experience"]?.status === "complete") score += 20;
    else if (sectionStatuses["experience"]?.status === "partial") score += 10;

    if (sectionStatuses["education"]?.status === "complete") score += 10;

    if (sectionStatuses["skills"]?.status === "complete") score += 15;
    else if (sectionStatuses["skills"]?.status === "partial") score += 7;

    if (sectionStatuses["projects"]?.status === "complete") score += 10;

    if (sectionStatuses["certifications"]?.status === "complete") score += 5;

    if (sectionStatuses["resume"]?.status === "complete") score += 5;

    if (sectionStatuses["privacy"]?.status === "complete") score += 5;

    return score;
  }, [sectionStatuses]);

  const profileStats = useMemo(() => [
    {
      label: "Profile strength",
      value: `${completenessScore}%`,
      icon: "monitoring",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Skills",
      value: `${profile?.skills?.length || 0}`,
      icon: "bolt",
      color: "text-featured",
      bg: "bg-featured-bg",
    },
    {
      label: "Experience",
      value: profile?.experience_years ? `${profile.experience_years} yrs` : profile?.experience?.length ? `${profile.experience.length} roles` : "Fresher",
      icon: "work_history",
      color: "text-experience",
      bg: "bg-experience-bg",
    },
    {
      label: "Visibility",
      value: activeVisibility === "everyone" ? "Public" : activeVisibility === "recruiters" ? "Recruiters" : "Hidden",
      icon: "visibility",
      color: "text-success",
      bg: "bg-success-bg",
    },
  ], [activeVisibility, completenessScore, profile?.experience, profile?.experience_years, profile?.skills]);

  if (fetchError) {
    // Height offset by --height-header plus 1px for the bottom header border
    return (
      <main className="justify-center flex-1 overflow-y-auto items-center py-8 bg-bg/50 flex h-[calc(100vh-var(--height-header)-1px)] px-4 md:py-12 md:px-10">
        <ErrorState
          title="Failed to load profile"
          description="There was a problem retrieving your candidate profile. Please check your network connection and try again."
          onRetry={fetchProfile}
        />
      </main>
    );
  }

  if (loading && !profile) {
    // Height offset by --height-header plus 1px for the bottom header border
    return (
      <main className="flex-1 overflow-y-auto animate-pulse py-8 bg-bg/50 h-[calc(100vh-var(--height-header)-1px)] px-4 md:py-12 md:px-10">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="rounded-2xl w-48 h-10 bg-border"></div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <div className="rounded-2xl bg-border h-64"></div>
            <div className="space-y-6">
              <div className="rounded-2xl bg-border h-80"></div>
              <div className="rounded-2xl bg-border h-80"></div>
            </div>
            <div className="h-96 rounded-2xl bg-border"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Height offset by --height-header plus 1px for the bottom header border */}
      <main
        className="custom-scrollbar flex-1 overflow-y-auto pb-32 pt-6 bg-bg h-[calc(100vh-var(--height-header)-1px)] candidate-profile-reference px-4 md:px-8 md:py-8"
      >
        <div className="max-w-[1440px] mx-auto animate-fade-in">
          <div className="items-center flex-wrap flex gap-5 mb-6 justify-between">
            <div className="gap-4 flex items-center min-w-0">
              <div className="justify-center shrink-0 size-12 items-center text-white shadow-sm bg-primary flex rounded-xl">
                <Network size={24} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="items-center gap-2 flex-wrap flex mb-1">
                  <h2 className="text-text type-h2 leading-none">Candidate Profile</h2>
                  <span className="text-xs text-primary h-7 border gap-1 inline-flex uppercase px-3 border-primary/20 items-center tracking-wide rounded-full bg-primary/10">
                    <Sparkles size={14} aria-hidden="true" />
                    Edit mode
                  </span>
                </div>
                <p className="type-caption text-muted">Keep your professional profile polished, searchable, and ready for recruiters.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {hasUnsavedChanges && (
                <>
                  <Button 
                    variant="secondary"
                    onClick={handleDiscard}
                  >
                    Discard Draft
                  </Button>
                  <Button 
                    onClick={handleSave}
                    isLoading={isSaving}
                  >
                    Save Draft
                  </Button>
                </>
              )}
            </div>
          </div>



          <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-[240px_1fr]">
            
            {/* Left Sidebar Navigation (Desktop only) */}
            <aside className="border-border hidden sticky shadow-sm bg-card p-4 top-6 space-y-4 rounded-xl border lg:block">
              {/* Mini Profile Header */}
              <div className="border-b items-center border-border/60 text-center pb-4 flex mb-2 flex-col">
                <div className="justify-center text-primary mb-3 type-h3 border-primary/20 items-center overflow-hidden bg-primary/10 rounded-full flex size-16 shadow-inner border">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <h3 className="w-full text-text break-words max-w-[200px] type-ui">
                  {profile?.full_name || "JobLyne User"}
                </h3>
                <p className="w-full text-xs break-words mt-0.5 max-w-[200px] text-muted line-clamp-1 leading-tight">
                  {profile?.headline || "Add a career headline"}
                </p>
                <div className="w-full mt-3 px-2">
                  <div className="text-xs uppercase items-center flex mb-1 text-muted justify-between">
                    <span>Profile strength</span>
                    <span className="text-primary">{completenessScore}%</span>
                  </div>
                  <div className="w-full h-1.5 border-border overflow-hidden bg-bg rounded-full border">
                    <div 
                      className="bg-primary transition-all h-full duration-500"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <h4 className="type-caption uppercase tracking-wider mb-2 text-muted">Profile Sections</h4>
              <nav className="space-y-1">
                {SECTIONS.map((sect) => {
                  const status = sectionStatuses[sect.id] || { status: "empty", error: false };
                  const isActive = activeSection === sect.id;
                  return (
                    <button
                      key={sect.id}
                      onClick={() => handleNavClick(sect.id)}
                      aria-current={isActive ? "location" : undefined}
                      aria-label={`${sect.label} section`}
                      className={`w-full cursor-pointer items-center transition-all rounded-lg p-2.5 flex text-left justify-between ${
                        isActive 
                          ? "text-primary bg-primary/10" 
                          : "text-muted hover:text-text hover:bg-bg/50"
                      }`}
                    >
                      <div className="flex gap-2.5 items-center">
                        <Icon name={sect.icon} size={18} aria-hidden="true" />
                        <span className="text-xs">{sect.label}</span>
                      </div>
                      
                      <div className="gap-1 flex items-center">
                        {status.status === "complete" ? (
                          <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                        ) : status.status === "partial" ? (
                          <span className="h-2.5 w-2.5 shadow-sm rounded-full bg-warning" title="Partially complete"></span>
                        ) : status.error ? (
                          <span className="bg-error h-2.5 w-2.5 rounded-full" title="Required fields missing"></span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile Bottom Navigation bar (Visible below lg screen size) */}
            <div className="lg:hidden no-scrollbar scroll-smooth left-4 bg-card/90 border border-border items-center p-2 backdrop-blur-md right-4 overflow-x-auto gap-2 flex bottom-6 z-50 shadow-lg rounded-xl fixed" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {SECTIONS.map((sect) => {
                const status = sectionStatuses[sect.id] || { status: "empty", error: false };
                const isActive = activeSection === sect.id;
                return (
                  <button
                    key={sect.id}
                    onClick={() => handleNavClick(sect.id)}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`${sect.label} section`}
                    className={`flex-shrink-0 justify-center cursor-pointer w-16 relative min-h-[44px] items-center p-2 transition-all rounded-lg gap-0.5 flex text-muted flex-col hover:text-primary ${
                      isActive ? "scale-105 text-primary bg-primary/10" : ""
                    }`}
                  >
                    <div className="relative">
                      <Icon name={sect.icon} size={18} aria-hidden="true" />
                      {status.status === "complete" ? (
                        <span className="-top-1 border h-2.5 w-2.5 absolute rounded-full border-white bg-success -right-1"></span>
                      ) : status.status === "partial" ? (
                        <span className="-top-1 border h-2.5 w-2.5 absolute bg-warning rounded-full border-white -right-1"></span>
                      ) : status.error ? (
                        <span className="-top-1 border bg-error h-2.5 w-2.5 absolute rounded-full border-white -right-1"></span>
                      ) : null}
                    </div>
                    <span className="w-full text-xs text-center truncate">{sect.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Center column: Form Editing Area */}
            <div className="min-w-0 space-y-8">
              <ProfileInfoCard 
                profile={profile} 
                onEdit={() => handleNavClick("personal")} 
              />

              <div className="space-y-8">
                <PersonalInfoSection 
                  profile={profile} 
                  onChange={handleChange} 
                />

                <AboutMeSection 
                  data={{ bio: profile?.bio }}
                  onChange={(field, val) => handleChange(field, val)}
                />

                <LanguagesSection
                  data={profile?.languages || []}
                  onChange={(val) => handleChange("languages", val)}
                />

                <JobPreferencesSection 
                  data={profile || {}}
                  onChange={handleChange}
                />

                <WorkExperienceSection 
                  data={profile?.experience || []} 
                  onChange={(val) => handleChange("experience", val)}
                />

                <EducationSection 
                  data={profile?.education || []} 
                  onChange={(val) => handleChange("education", val)}
                />

                <SkillsSection 
                  data={profile?.skills || []} 
                  onChange={(val) => handleChange("skills", val)}
                />

                <ProjectsSection 
                  projects={profile?.projects || []}
                  onChange={(val) => handleChange("projects", val)}
                />

                <CertificationsSection 
                  certifications={profile?.certifications || []}
                  onChange={(val) => handleChange("certifications", val)}
                />


                <PrivacySettingsSection 
                  privacySettings={profile?.privacy_settings || {}}
                  onChange={(val) => handleChange("privacy_settings", val)}
                />
              </div>
            </div>

          </div>
        </div>


      </main>
    </>
  );
}
