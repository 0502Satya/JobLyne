import React from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/services/profile.server";
import ProfilePageClient from "@/features/dashboard/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  let profile = null;

  try {
    profile = await getProfile();
  } catch (error) {
    // If not authenticated or API fetch fails, redirect to signin
    redirect("/auth/signin");
  }

  return <ProfilePageClient initialProfile={profile} />;
}
