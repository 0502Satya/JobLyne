"use client";

import { useState, useCallback } from "react";
import { changePasswordAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";

export function useSecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await changePasswordAction({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to change password. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    handleSave
  };
}
