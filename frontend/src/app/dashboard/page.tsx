"use client";

import React, { useEffect, useState } from "react";
import { getCandidateProfileAction } from "@/features/auth/actions";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
import JobFeed from "@/features/dashboard/components/JobFeed";
import DashboardRightSidebar from "@/features/dashboard/components/DashboardRightSidebar";
import { LoadingState } from "@/shared/ui";

export default function CandidateDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const profileData = await getCandidateProfileAction();
      if (!profileData.error) setProfile(profileData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <LoadingState variant="card" rows={3} />
      </div>
    );
  }

  return (
    <div className="flex gap-8 flex-col">
      {/* Welcome Header */}
      <div className="mb-2">
        <h1 className="text-text type-h1 mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || "Alex"}! 👋
        </h1>
        <p className="text-muted">Here&apos;s what&apos;s happening with your job search today.</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

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
