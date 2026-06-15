"use client";

import React from "react";
import Link from "next/link";
import UserMenu from "@/features/auth/components/UserMenu";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "@/shared/ui/ThemeToggle";

interface DashboardHeaderProps {
  initials?: string;
  userName?: string;
  profileImage?: string;
}

const headerNavLinks = [
  { name: "Jobs", href: "/dashboard/jobs" },
  { name: "Companies", href: "/dashboard/companies" },
  { name: "Salaries", href: "/dashboard/salaries" },
  { name: "Community", href: "/dashboard/community" },
  { name: "Upskill", href: "/dashboard/upskill" },
];

export default function DashboardHeader({
  initials = "AL",
  userName = "JobLyne User",
  profileImage,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border bg-surface px-6 lg:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-4">
          <div className="text-primary size-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">hub</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">JobLyne</h2>
        </Link>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full group">
            <div className="text-muted flex border-none bg-bg items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined text-sm">search</span>
            </div>
            <input 
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text focus:outline-0 focus:ring-0 border-none bg-bg h-full placeholder:text-muted px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
              placeholder="Search jobs, skills, companies..." 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 justify-end gap-8">
        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {headerNavLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className="text-muted hover:text-primary transition-colors text-sm font-medium leading-normal"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex gap-3 items-center">
          <NotificationCenter />
          <ThemeToggle />
          <UserMenu initials={initials} profileImage={profileImage} />
        </div>
      </div>
    </header>
  );
}
