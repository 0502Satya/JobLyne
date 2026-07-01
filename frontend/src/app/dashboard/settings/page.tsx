import React from "react";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/services/profile.server";
import SettingsPageClient from "@/features/dashboard/components/settings/SettingsPageClient";

export default async function SettingsPage() {
  let profile = null;

  try {
    profile = await getUserProfile();
  } catch (error) {
    redirect("/auth/signin");
  }

  return <SettingsPageClient initialProfile={profile} />;
}
