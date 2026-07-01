import React from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/services/dashboard.server";
import DashboardLayoutClient from "@/features/dashboard/components/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = null;
  let stats = null;

  try {
    const data = await getDashboardData();
    profile = data.profile;
    stats = data.stats;
  } catch (error) {
    // If not authenticated or API fetch fails, redirect to signin page
    redirect("/auth/signin");
  }

  return (
    <DashboardLayoutClient profile={profile} stats={stats}>
      {children}
    </DashboardLayoutClient>
  );
}
