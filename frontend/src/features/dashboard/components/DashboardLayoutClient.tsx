"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";
import DashboardSidebar from "./DashboardSidebar";
import { Icon } from "@/shared/ui";
import { Profile, DashboardStats } from "@/types/profile";

const mobileNavLinks = [
  { name: "Feed", icon: "dashboard", href: "/dashboard" },
  { name: "Apps", icon: "work", href: "/dashboard/applications" },
  { name: "Saved", icon: "bookmark", href: "/dashboard/saved-jobs" },
  { name: "Chats", icon: "chat", href: "/dashboard/messages" },
  { name: "Alerts", icon: "notifications_active", href: "/dashboard/alerts" },
];

interface DashboardLayoutClientProps {
  profile: Profile | null;
  stats: DashboardStats | null;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  profile,
  stats,
  children,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/dashboard/profile";

  return (
    <div className="w-full bg-bg flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />

      <div className="w-full flex-1 mx-auto max-w-[1440px] flex relative">
        {!isProfilePage && (
          <DashboardSidebar 
            profile={profile}
            stats={stats}
          />
        )}

        <main className={`flex-1 pb-24 md:pb-10 ${isProfilePage ? "p-0" : "p-6 md:p-10"}`}>
          {children}
        </main>
      </div>

      <Footer />

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around md:hidden px-2 pb-safe shadow-lg">
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
