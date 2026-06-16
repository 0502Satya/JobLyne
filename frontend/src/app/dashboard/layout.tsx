"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import { getCandidateProfileAction, getDashboardStatsAction } from "@/features/auth/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [profileData, statsData] = await Promise.all([
        getCandidateProfileAction(),
        getDashboardStatsAction()
      ]);

      if (profileData.error) {
        // Clear invalid/unauthorized session cookies to prevent infinite redirect loop
        const { logoutAction } = await import("@/features/auth/actions");
        await logoutAction();
        return;
      }

      setProfile(profileData);
      if (!statsData.error) setStats(statsData);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : "AL";

  const isProfilePage = pathname === "/dashboard/profile";

  return (
    <div className="bg-bg min-h-screen flex flex-col w-full overflow-x-hidden">
      <DashboardHeader
        initials={initials}
        userName={profile?.full_name}
        profileImage={profile?.profile_image}
      />

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        {!isProfilePage && (
          <DashboardSidebar 
            profile={profile}
            stats={stats}
          />
        )}

        <main className={`flex-1 overflow-x-hidden ${isProfilePage ? "p-0" : "p-6 md:p-10"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
