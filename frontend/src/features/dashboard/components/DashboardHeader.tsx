"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/features/auth/components/UserMenu";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "@/shared/ui/ThemeToggle";
import { Input } from "@/shared/ui";
import { Network } from "lucide-react";

interface DashboardHeaderProps {
  initials?: string;
  userName?: string;
  profileImage?: string;
}

const headerNavLinks = [
  { name: "Jobs", href: "/jobs" },
  { name: "Companies", href: "#", disabled: true },
  { name: "Salaries", href: "#", disabled: true },
  { name: "Community", href: "#", disabled: true },
  { name: "Upskill", href: "/courses" },
];

export default function DashboardHeader({
  initials = "AL",
  userName = "JobLyne User",
  profileImage,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border px-6 whitespace-nowrap items-center py-3 sticky z-50 flex top-0 bg-surface justify-between lg:px-10">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/dashboard" className="gap-4 flex items-center">
          <div className="justify-center text-primary size-8 items-center flex">
            <Network size={28} aria-hidden="true" />
          </div>
          <h2 className="tracking-tight type-h3 text-text leading-tight font-bold">JobLyne</h2>
        </Link>

        {/* Search Bar */}
        <div className="min-w-40 max-w-64 hidden sm:block">
          <label htmlFor="dashboard-search" className="sr-only">Search jobs, skills, and companies</label>
          <Input 
            id="dashboard-search"
            aria-label="Search jobs, skills, and companies"
            icon="search"
            placeholder="Search jobs, skills, companies..."
            className="h-10 py-1 bg-bg border-none"
          />
        </div>
      </div>

      <div className="flex justify-end flex-1 gap-8">
        {/* Navigation Links with Active States */}
        <nav className="gap-6 hidden items-center lg:flex h-full">
          {headerNavLinks.map((link) => {
            if (link.disabled) {
              return (
                <span
                  key={link.name}
                  title={`${link.name} - Coming Soon`}
                  className="type-label leading-normal text-muted/50 cursor-not-allowed py-1 border-b-2 border-transparent select-none"
                  aria-disabled="true"
                >
                  {link.name}
                </span>
              );
            }
            const isActive = pathname === link.href || (link.href !== "/jobs" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`type-label leading-normal transition-colors hover:text-primary py-1 border-b-2 ${
                  isActive 
                    ? "text-primary font-bold border-primary" 
                    : "border-transparent text-muted"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
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
