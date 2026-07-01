import React from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/services/profile.server";
import { getDashboardStats } from "@/services/dashboard.server";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
import ProfileAnalytics from "@/features/dashboard/components/ProfileAnalytics";
import JobFeed from "@/features/dashboard/components/JobFeed";
import DashboardRightSidebar from "@/features/dashboard/components/DashboardRightSidebar";
import { LoadingState } from "@/shared/ui";

export default async function CandidateDashboardPage() {
  let profile = null;
  let stats = null;

  try {
    [profile, stats] = await Promise.all([
      getProfile(),
      getDashboardStats()
    ]);
  } catch (error) {
    redirect("/auth/signin");
  }

  const firstName = profile?.full_name?.split(' ')[0] || "User";

  return (
    <div className="flex gap-8 flex-col">
      {/* Welcome Header */}
      <div className="mb-2 text-left">
        <h1 className="text-text type-h1 mb-2 font-extrabold tracking-tight text-3xl">
          Welcome back, <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{firstName}</span>! 👋
        </h1>
        <p className="text-muted text-sm">Here&apos;s what&apos;s happening with your job search today.</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Profile Analytics Analytics Display */}
      <ProfileAnalytics />

      {/* Main Grid: Feed + Side Column */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left: Job Feed */}
        <div className="flex-1 min-w-0">
          <React.Suspense fallback={
            <LoadingState variant="list" rows={3} />
          }>
            <JobFeed />
          </React.Suspense>
        </div>

        {/* Right: Side Widgets — sticky to top of viewport */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 sticky top-[calc(var(--height-header)+16px)] self-start">
          <DashboardRightSidebar />
        </aside>
      </div>
    </div>
  );
}
