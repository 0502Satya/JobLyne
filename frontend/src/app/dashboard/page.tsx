import React from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/services/profile.server";
import { getDashboardStats } from "@/services/dashboard.server";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
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

      {/* Main Grid: Feed + Side Column */}
      <div className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Job Feed */}
        <div className="lg:col-span-2">
          <React.Suspense fallback={
            <LoadingState variant="list" rows={3} />
          }>
            <JobFeed />
          </React.Suspense>
        </div>

        {/* Right: Side Widgets */}
        <aside className="lg:sticky lg:top-[calc(var(--height-header)+16px)]">
          <DashboardRightSidebar />
        </aside>
      </div>
    </div>
  );
}
