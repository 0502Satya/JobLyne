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
import ResumeBuilderSection from "@/features/dashboard/components/profile/ResumeBuilderSection";
import PrivacySettingsSection from "@/features/dashboard/components/profile/PrivacySettingsSection";
import UnsavedChangesBar from "@/features/dashboard/components/profile/UnsavedChangesBar";
import Toast from "@/features/dashboard/components/profile/Toast";
import ProfileInfoCard from "@/features/dashboard/components/profile/ProfileInfoCard";

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
  { id: "resume", label: "Resume Builder", icon: "analytics" },
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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
      setToast({ message: "Profile updated successfully!", type: "success" });
    } else {
      setToast({ message: result.error || "Failed to save profile", type: "error" });
    }
    setIsSaving(false);
  };

  const handleDiscard = () => {
    if (originalProfile) {
      setProfile(structuredClone(originalProfile));
      setHasUnsavedChanges(false);
      setToast({ message: "Changes discarded", type: "success" });
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
      color: "text-[#9333ea]",
      bg: "bg-[#faf0ff]",
    },
    {
      label: "Experience",
      value: profile?.experience_years ? `${profile.experience_years} yrs` : profile?.experience?.length ? `${profile.experience.length} roles` : "Fresher",
      icon: "work_history",
      color: "text-[#ea580c]",
      bg: "bg-[#fff2e9]",
    },
    {
      label: "Visibility",
      value: activeVisibility === "everyone" ? "Public" : activeVisibility === "recruiters" ? "Recruiters" : "Hidden",
      icon: "visibility",
      color: "text-[#16a34a]",
      bg: "bg-[#e9f9ef]",
    },
  ], [activeVisibility, completenessScore, profile?.experience, profile?.experience_years, profile?.skills]);

  if (fetchError) {
    return (
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-12 h-[calc(100vh-73px)] bg-slate-50/50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl font-bold">error</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Failed to load profile</h3>
            <p className="text-sm text-slate-500 mt-1">
              There was a problem retrieving your candidate profile. Please check your network connection and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchProfile}
            className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (loading && !profile) {
    return (
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-12 h-[calc(100vh-73px)] animate-pulse bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="h-10 w-48 bg-slate-250 rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-8">
            <div className="h-64 bg-slate-250 rounded-2xl"></div>
            <div className="space-y-6">
              <div className="h-80 bg-slate-250 rounded-2xl"></div>
              <div className="h-80 bg-slate-250 rounded-2xl"></div>
            </div>
            <div className="h-96 bg-slate-250 rounded-2xl"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <UnsavedChangesBar 
        isVisible={hasUnsavedChanges} 
        onSave={handleSave} 
        onDiscard={handleDiscard} 
      />
      <main
        className="candidate-profile-reference flex-1 overflow-y-auto px-4 pt-6 pb-32 md:px-8 md:py-8 h-[calc(100vh-73px)] custom-scrollbar bg-bg"
        style={{
          "--color-primary": "14 124 134",
          "--color-primary-dark": "10 87 94",
          "--color-primary-light": "#e7f4f5",
        } as React.CSSProperties}
      >
        <div className="max-w-[1440px] mx-auto animate-fade-in">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[26px]">hub</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-none">Candidate Profile</h2>
                  <span className="inline-flex h-7 items-center gap-1 rounded-full bg-primary/10 px-3 text-[11px] font-black uppercase tracking-wide text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Edit mode
                  </span>
                </div>
                <p className="text-muted font-semibold text-xs sm:text-sm">Keep your professional profile polished, searchable, and ready for recruiters.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <>
                  <button 
                    onClick={handleDiscard}
                    className="px-4 py-2.5 rounded-lg bg-card text-text font-bold text-xs border border-border hover:bg-bg hover:text-text transition-all min-h-[40px] flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    Discard Draft
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-xs transition-all shadow-sm hover:bg-primary-dark flex items-center gap-2 min-h-[40px] justify-center cursor-pointer"
                  >
                    {isSaving ? "Saving..." : "Save Draft"}
                  </button>
                </>
              )}
            </div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {profileStats.map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-muted">{stat.label}</p>
                  <p className="text-xl font-black text-text mt-1">{stat.value}</p>
                </div>
                <div className={`size-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_minmax(0,1fr)_310px] gap-6 items-start">
            
            {/* Left Sidebar Navigation (Desktop only) */}
            <aside className="hidden lg:block sticky top-6 bg-card rounded-xl p-4 border border-border shadow-sm space-y-4">
              {/* Mini Profile Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-border/60 mb-2">
                <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold mb-3 overflow-hidden shadow-inner">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <h3 className="text-sm font-bold text-text break-words w-full max-w-[200px]">
                  {profile?.full_name || "JobLyne User"}
                </h3>
                <p className="text-[11px] font-semibold text-muted leading-tight mt-0.5 line-clamp-1 break-words w-full max-w-[200px]">
                  {profile?.headline || "Add a career headline"}
                </p>
                <div className="w-full mt-3 px-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase mb-1">
                    <span>Profile strength</span>
                    <span className="text-primary">{completenessScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg border border-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Profile Sections</h4>
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
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                        isActive 
                          ? "bg-primary/10 text-primary font-bold" 
                          : "text-muted hover:bg-bg/50 hover:text-text font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-lg">{sect.icon}</span>
                        <span className="text-xs">{sect.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {status.status === "complete" ? (
                          <span className="material-symbols-outlined text-base text-emerald-500 font-bold">check_circle</span>
                        ) : status.status === "partial" ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" title="Partially Complete"></span>
                        ) : status.error ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" title="Required Fields Missing"></span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile Bottom Navigation bar (Visible below lg screen size) */}
            <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50 bg-card/90 backdrop-blur-md rounded-xl p-2 border border-border shadow-lg flex items-center overflow-x-auto gap-2 no-scrollbar scroll-smooth" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {SECTIONS.map((sect) => {
                const status = sectionStatuses[sect.id] || { status: "empty", error: false };
                const isActive = activeSection === sect.id;
                return (
                  <button
                    key={sect.id}
                    onClick={() => handleNavClick(sect.id)}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`${sect.label} section`}
                    className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg w-16 text-muted hover:text-primary transition-all cursor-pointer relative min-h-[44px] ${
                      isActive ? "text-primary font-bold scale-105 bg-primary/10" : ""
                    }`}
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined text-lg">{sect.icon}</span>
                      {status.status === "complete" ? (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
                      ) : status.status === "partial" ? (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></span>
                      ) : status.error ? (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400 border border-white"></span>
                      ) : null}
                    </div>
                    <span className="text-[10px] font-semibold truncate w-full text-center">{sect.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Center column: Form Editing Area */}
            <div className="space-y-8 min-w-0">
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

                <ResumeBuilderSection 
                  profile={profile}
                  onChange={handleChange}
                />

                <PrivacySettingsSection 
                  privacySettings={profile?.privacy_settings || {}}
                  onChange={(val) => handleChange("privacy_settings", val)}
                />
              </div>
            </div>

            {/* Right Sticky Sidebar: Completeness Widget & Visibility Index */}
            <aside className="hidden xl:block sticky top-6 space-y-5">
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm text-center space-y-5">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Profile Completeness</h4>
                
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--color-bg)"
                      strokeWidth="6"
                      fill="transparent"
                      className="stroke-border"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - completenessScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0E7C86" />
                        <stop offset="100%" stopColor="#0a575e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-text">{completenessScore}%</span>
                    <span className="text-xs font-bold uppercase text-muted tracking-wider">Completeness</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-left pt-2 border-t border-border/60">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">Recommended Actions</span>
                  <div className="space-y-1.5">
                    {completenessScore < 100 ? (
                      <>
                        {sectionStatuses["resume"]?.status !== "complete" && (
                          <button
                            onClick={() => handleNavClick("resume")}
                            className="w-full text-left p-2 bg-bg hover:bg-primary/10 rounded-lg text-xs font-semibold text-muted hover:text-primary flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs text-primary font-bold">add</span>
                            Upload resume (+5%)
                          </button>
                        )}
                        {sectionStatuses["experience"]?.status !== "complete" && (
                          <button
                            onClick={() => handleNavClick("experience")}
                            className="w-full text-left p-2 bg-bg hover:bg-primary/10 rounded-lg text-xs font-semibold text-muted hover:text-primary flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs text-primary font-bold">add</span>
                            Add Work Experience (+20%)
                          </button>
                        )}
                        {sectionStatuses["skills"]?.status !== "complete" && (
                          <button
                            onClick={() => handleNavClick("skills")}
                            className="w-full text-left p-2 bg-bg hover:bg-primary/10 rounded-lg text-xs font-semibold text-muted hover:text-primary flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs text-primary font-bold">add</span>
                            Add 3 skills (+15%)
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-center text-xs font-bold text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-base">verified</span>
                        Profile fully complete!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary font-bold text-lg">visibility</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Profile Visibility</span>
                </div>

                <div className="space-y-3">
                  {/* Everyone */}
                  <label
                    onClick={() => handleVisibilityChange("everyone")}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      activeVisibility === "everyone"
                        ? "border-primary bg-primary/10 text-text"
                        : "border-border hover:border-border/80 text-muted bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        activeVisibility === "everyone" ? "border-primary" : "border-border"
                      }`}>
                        {activeVisibility === "everyone" && (
                          <div className="w-2 bg-primary h-2 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">Everyone</span>
                      <span className="text-[10px] text-muted font-semibold block mt-0.5 leading-snug">
                        Maximum reach. Open search engines and recruiters.
                      </span>
                    </div>
                  </label>

                  {/* Recruiters & companies */}
                  <label
                    onClick={() => handleVisibilityChange("recruiters")}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      activeVisibility === "recruiters"
                        ? "border-primary bg-primary/10 text-text"
                        : "border-border hover:border-border/80 text-muted bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        activeVisibility === "recruiters" ? "border-primary" : "border-border"
                      }`}>
                        {activeVisibility === "recruiters" && (
                          <div className="w-2 bg-primary h-2 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">Recruiters & companies</span>
                      <span className="text-[10px] text-muted font-semibold block mt-0.5 leading-snug">
                        Recommended. Only verified recruiters can find you.
                      </span>
                    </div>
                  </label>

                  {/* Hidden */}
                  <label
                    onClick={() => handleVisibilityChange("hidden")}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      activeVisibility === "hidden"
                        ? "border-primary bg-primary/10 text-text"
                        : "border-border hover:border-border/80 text-muted bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        activeVisibility === "hidden" ? "border-primary" : "border-border"
                      }`}>
                        {activeVisibility === "hidden" && (
                          <div className="w-2 bg-primary h-2 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">Hidden</span>
                      <span className="text-[10px] text-muted font-semibold block mt-0.5 leading-snug">
                        Off the radar. Only visible via direct job applications.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </main>
    </>
  );
}
