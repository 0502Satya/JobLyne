"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/shared/ui/Icon";

import { Profile, DashboardStats } from "@/types/profile";

interface DashboardSidebarProps {
  profile: Profile | null;
  stats: DashboardStats | null;
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

  // Use profile completeness from API; show 0 if not yet loaded
  const completeness: number = profile?.completeness ?? 0;

  // Derive initials for avatar fallback
  const initials = profile?.full_name
    ? profile.full_name.trim().split(/\s+/).map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
    : "";

  // Height offset by --height-header plus 1px to compensate for the bottom border on the header container.
  return (
    <aside className="w-64 border-border hidden pt-6 pb-6 border-r px-4 bg-surface flex-col md:flex flex-shrink-0 md:sticky md:top-[var(--height-header)] md:h-[calc(100vh-var(--height-header))] overflow-hidden">
      {/* User Summary */}
      <div className="border-b border-border items-center text-center pb-6 flex flex-col">
        {/* Avatar */}
        {profile?.profile_photo_url ? (
          <div
            className="mb-3 bg-cover bg-no-repeat aspect-square bg-center border-bg shadow-sm rounded-full border-4 size-20"
            style={{ backgroundImage: `url(${profile.profile_photo_url})` }}
          />
        ) : (
          <div className="mb-3 size-20 rounded-full border-4 border-bg shadow-sm bg-primary/10 text-primary flex items-center justify-center type-h3 shrink-0">
            {initials}
          </div>
        )}

        {/* Name */}
        {profile?.full_name && (
          <h2 className="text-text type-card-title leading-tight">
            {profile.full_name}
          </h2>
        )}

        {/* Headline — only shown when present */}
        {profile?.headline && (
          <p className="type-body-sm text-muted mt-0.5">{profile.headline}</p>
        )}

        {/* Profile completeness bar */}
        <div className="w-full mt-4">
          <div className="flex mb-1 text-xs justify-between">
            <span className="text-left text-muted">Profile Completeness</span>
            <span className="text-primary">{completeness}%</span>
          </div>
          <div className="w-full bg-border/20 rounded-full h-2">
            <div
              className="h-2 transition-all rounded-full duration-500 bg-primary"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <p className="text-xs text-left text-muted mt-2">
              Complete your profile to increase visibility.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Links — scrollable if content overflows */}
      <nav className="flex-1 overflow-y-auto gap-1 flex flex-col mt-6">
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
              {link.name === "My Applications" && (stats?.applications ?? 0) > 0 && (
                <span className="px-2 ml-auto rounded-full py-0.5 bg-border/40 type-caption text-muted">
                  {stats?.applications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
