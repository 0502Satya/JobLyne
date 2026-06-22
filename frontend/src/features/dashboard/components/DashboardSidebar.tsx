"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import Icon from "@/shared/ui/Icon";
import { Settings, LogOut } from "lucide-react";

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
];


export default function DashboardSidebar({ profile, stats }: DashboardSidebarProps) {
  const pathname = usePathname();
  const completeness = profile?.completeness || 75;

  return (
    <aside className="h-[calc(100vh-65px)] w-64 border-border overflow-y-auto hidden pt-6 sticky top-[65px] gap-6 pb-6 border-right px-4 bg-surface flex-col md:flex">
      {/* User Summary */}
      <div className="border-b border-border items-center text-center pb-6 flex flex-col">
        <div 
          className="mb-3 bg-cover bg-no-repeat aspect-square bg-center border-bg shadow-sm rounded-full border-4 size-20"
          style={{ backgroundImage: `url(${profile?.profile_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAs17bU3rIouTgNjBdP1LAEfCfrJ0ef0Qqf2OTGBidiwrqva-MkyupB0L8WHDUi1_bZYQVIFUjeVAFsramQ1IKOo5-nZjq6MYBmXckvow52QcfIMTkvghXeOj1w6ddyX3ta7TsE7nsUwmqPQg5MmBOE6WXghZbTk6MfZrNPQBMzf3BiOk3JnwVIQOrgSSwEVjQD5i29Ytazs6pZZTqn86pwzzepqLpyT16MAlf6E6BKQEaEnmnjsSChfKoNBGy7RIzP-I_Nl-czFaY"})` }}
        ></div>
        <h1 className="text-text type-card-title leading-tight">
          {profile?.full_name || "Alex Morgan"}
        </h1>
        <p className="type-body-sm text-muted">
          {profile?.headline || "Senior Software Engineer"}
        </p>

        <div className="w-full mt-4">
          <div className="flex mb-1 text-xs justify-between">
            <span className="text-left text-muted">Profile Completeness</span>
            <span className="text-primary">{completeness}%</span>
          </div>
          <div className="w-full bg-border/20 rounded-full h-2">
            <div 
              className="h-2 transition-all rounded-full duration-500 bg-primary" 
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
          <p className="text-xs text-left text-muted mt-2">Complete your profile to get 3x more views.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="gap-1 flex flex-col">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name}
              href={link.href}
              className={`group px-3 items-center rounded-lg gap-3 py-2.5 transition-colors flex ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted hover:bg-bg"
              }`}
            >
              <Icon name={link.icon} size={20} />
              <span className="type-ui">{link.name}</span>
              {link.name === "My Applications" && stats?.applications > 0 && (
                <span className="px-2 ml-auto rounded-full py-0.5 bg-border/40 type-caption text-muted">
                  {stats.applications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-border mt-auto gap-1 pt-6 flex flex-col">
        <Link 
          href="/dashboard/settings"
          className="px-3 items-center rounded-lg gap-3 py-2.5 transition-colors flex text-muted hover:bg-bg"
        >
          <Settings size={20} aria-hidden="true" />
          <span className="type-ui">Settings</span>
        </Link>
        <form action={logoutAction}>
          <button 
            type="submit"
            className="w-full px-3 items-center rounded-lg gap-3 py-2.5 transition-colors flex text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="type-ui">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
