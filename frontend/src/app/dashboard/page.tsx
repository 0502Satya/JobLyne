"use client";

import React, { useEffect, useState } from "react";
import { getCandidateProfileAction } from "@/features/auth/actions";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
import JobFeed from "@/features/dashboard/components/JobFeed";
import DashboardRightSidebar from "@/features/dashboard/components/DashboardRightSidebar";

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
      <div className="text-text gap-8 animate-pulse flex flex-col">
        <div className="border-border h-20 bg-surface rounded-xl border"></div>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 border-border bg-surface rounded-xl border"></div>)}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
           <div className="lg:col-span-2 border-border h-[600px] bg-surface rounded-xl border"></div>
           <div className="border-border h-[600px] bg-surface rounded-xl border"></div>
        </div>
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
            <div className="flex gap-6 flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-border animate-pulse shadow-sm h-44 bg-surface rounded-xl border"></div>
              ))}
            </div>
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
