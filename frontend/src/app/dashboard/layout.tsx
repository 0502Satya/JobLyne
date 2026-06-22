"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import { getCandidateProfileAction, getDashboardStatsAction } from "@/features/auth/actions";
import { Icon } from "@/shared/ui";

const mobileNavLinks = [
  { name: "Feed", icon: "dashboard", href: "/dashboard" },
  { name: "Apps", icon: "work", href: "/dashboard/applications" },
  { name: "Saved", icon: "bookmark", href: "/dashboard/saved-jobs" },
  { name: "Chats", icon: "chat", href: "/dashboard/messages" },
  { name: "Alerts", icon: "notifications_active", href: "/dashboard/alerts" },
];

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
      <div className="justify-center items-center bg-bg flex min-h-screen">
        <div className="h-12 w-12 border-b-2 border-t-2 rounded-full border-primary animate-spin"></div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : "AL";

  const isProfilePage = pathname === "/dashboard/profile";

  return (
    <div className="w-full bg-bg overflow-x-hidden flex min-h-screen flex-col">
      <DashboardHeader
        initials={initials}
        userName={profile?.full_name}
        profileImage={profile?.profile_image}
      />

      <div className="w-full flex-1 mx-auto max-w-[1440px] flex relative">
        {!isProfilePage && (
          <DashboardSidebar 
            profile={profile}
            stats={stats}
          />
        )}

        <main className={`overflow-x-hidden flex-1 pb-20 md:pb-0 ${isProfilePage ? "p-0 pb-20 md:pb-0" : "p-6 md:p-10"}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around md:hidden px-2 pb-safe shadow-lg">
        {mobileNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive ? "text-primary" : "text-muted hover:text-text"
              }`}
            >
              <Icon 
                name={link.icon} 
                size={20} 
                className={isActive ? "text-primary" : "text-muted"} 
                aria-hidden="true" 
              />
              <span className="text-[10px] font-semibold tracking-tight mt-0.5">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
