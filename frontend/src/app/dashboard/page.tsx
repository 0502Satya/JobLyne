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
      <div className="flex flex-col gap-8 animate-pulse text-text">
        <div className="h-20 bg-surface rounded-xl border border-border"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface rounded-xl border border-border"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-[600px] bg-surface rounded-xl border border-border"></div>
           <div className="h-[600px] bg-surface rounded-xl border border-border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="mb-2">
        <h2 className="text-3xl font-black tracking-tight text-text mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || "Alex"}! 👋
        </h2>
        <p className="text-muted font-medium">Here&apos;s what&apos;s happening with your job search today.</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Grid: Feed + Side Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Job Feed */}
        <div className="lg:col-span-2">
          <React.Suspense fallback={
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-surface rounded-xl animate-pulse border border-border shadow-sm"></div>
              ))}
            </div>
          }>
            <JobFeed />
          </React.Suspense>
        </div>

        {/* Right: Side Widgets */}
        <aside className="lg:sticky lg:top-[85px]">
          <DashboardRightSidebar />
        </aside>
      </div>
    </div>
  );
}
