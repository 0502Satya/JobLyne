"use client";

import { useState, useRef, useCallback } from "react";
import { Profile } from "@/types/profile";

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

const complexKeys: (keyof Profile)[] = [
  "work_mode", "preferred_locations", "social_links", "experience",
  "education", "projects", "certifications", "skills", "languages",
  "privacy_settings"
];

function isProfileDirty(a: Profile, b: Profile): boolean {
  if (a === b) return false;
  if (!a || !b) return true;

  for (const key of primitiveKeys) {
    if (a[key] !== b[key]) {
      return true;
    }
  }

  for (const key of complexKeys) {
    const valA = a[key];
    const valB = b[key];
    if (JSON.stringify(valA) !== JSON.stringify(valB)) {
      return true;
    }
  }

  return false;
}

export function useProfileForm(initialProfile: Profile) {
  const originalRef = useRef<Profile>(initialProfile);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isDirty, setIsDirty] = useState(false);

  const calculateDirty = useCallback((current: Profile) => {
    setIsDirty(isProfileDirty(current, originalRef.current));
  }, []);

  const handleChange = useCallback(<K extends keyof Profile>(field: K, value: Profile[K]) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-derive full_name if first_name, middle_name, or last_name changes
      if (field === "first_name" || field === "middle_name" || field === "last_name") {
        const fname = field === "first_name" ? (value as string) : (prev.first_name || "");
        const mname = field === "middle_name" ? (value as string) : (prev.middle_name || "");
        const lname = field === "last_name" ? (value as string) : (prev.last_name || "");
        updated.full_name = [fname, mname, lname].filter(Boolean).join(" ");
      }
      
      calculateDirty(updated);
      return updated;
    });
  }, [calculateDirty]);

  const resetForm = useCallback(() => {
    setProfile(originalRef.current);
    setIsDirty(false);
  }, []);

  const confirmSave = useCallback((savedProfile: Profile) => {
    originalRef.current = savedProfile;
    setProfile(savedProfile);
    setIsDirty(false);
  }, []);

  return {
    profile,
    isDirty,
    handleChange,
    resetForm,
    confirmSave
  };
}
