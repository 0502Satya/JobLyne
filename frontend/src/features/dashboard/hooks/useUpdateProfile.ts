"use client";

import { useState } from "react";
import { Profile } from "@/types/profile";
import { updateCandidateProfileAction } from "@/features/auth/candidateActions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useUpdateProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const updateProfile = async (profileData: Profile): Promise<Profile | null> => {
    setIsSaving(true);
    try {
      const res = await updateCandidateProfileAction(profileData);
      
      if (res.error) {
        toast.error(res.error);
        return null;
      }
      
      toast.success("Profile saved successfully!");
      router.refresh();
      return res.data;
    } catch (err) {
      toast.error("Network or server connection failed. Please try again.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    updateProfile
  };
}
