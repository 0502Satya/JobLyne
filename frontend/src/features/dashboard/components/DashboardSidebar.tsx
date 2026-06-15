"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";

interface DashboardSidebarProps {
  profile: any;
  stats: any;
}

const sidebarLinks = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard", filled: true },
  { name: "My Applications", icon: "work", href: "/dashboard/applications" },
  { name: "Saved Jobs", icon: "bookmark", href: "/dashboard/saved-jobs" },
  { name: "Messages", icon: "chat", href: "/dashboard/messages" },
  { name: "Job Alerts", icon: "notifications_active", href: "/dashboard/alerts" },
  { name: "My Learning", icon: "school", href: "/dashboard/learning" },
  { name: "Resume Services", icon: "description", href: "/dashboard/services" },
];


export default function DashboardSidebar({ profile, stats }: DashboardSidebarProps) {
  const pathname = usePathname();
  const completeness = profile?.completeness || 75;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-surface border-right border-border pt-6 pb-6 px-4 gap-6 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      {/* User Summary */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-border">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 mb-3 border-4 border-bg shadow-sm"
          style={{ backgroundImage: `url(${profile?.profile_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAs17bU3rIouTgNjBdP1LAEfCfrJ0ef0Qqf2OTGBidiwrqva-MkyupB0L8WHDUi1_bZYQVIFUjeVAFsramQ1IKOo5-nZjq6MYBmXckvow52QcfIMTkvghXeOj1w6ddyX3ta7TsE7nsUwmqPQg5MmBOE6WXghZbTk6MfZrNPQBMzf3BiOk3JnwVIQOrgSSwEVjQD5i29Ytazs6pZZTqn86pwzzepqLpyT16MAlf6E6BKQEaEnmnjsSChfKoNBGy7RIzP-I_Nl-czFaY"})` }}
        ></div>
        <h1 className="text-text text-lg font-bold leading-tight">
          {profile?.full_name || "Alex Morgan"}
        </h1>
        <p className="text-muted text-sm font-normal">
          {profile?.headline || "Senior Software Engineer"}
        </p>

        <div className="mt-4 w-full">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted font-medium text-left">Profile Completeness</span>
            <span className="text-primary font-bold">{completeness}%</span>
          </div>
          <div className="w-full bg-border/20 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-muted mt-2 text-left">Complete your profile to get 3x more views.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted hover:bg-bg"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive && link.filled ? "filled" : ""}`}>
                {link.icon}
              </span>
              <span className="text-sm font-medium">{link.name}</span>
              {link.name === "My Applications" && stats?.applications > 0 && (
                <span className="ml-auto bg-border/40 text-muted text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.applications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-auto pt-6 border-t border-border flex flex-col gap-1">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:bg-bg transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <form action={logoutAction}>
          <button 
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
