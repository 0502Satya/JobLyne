"use client";

import { useState, useCallback } from "react";
import { updateUserProfileAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useProfileSettings(initialFirstName: string, initialLastName: string) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfileAction({
        first_name: firstName,
        last_name: lastName
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile details updated successfully.");
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  }, [firstName, lastName, router]);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    isSaving,
    handleSave
  };
}
