"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction, getRecruiterProfileAction } from "@/features/auth/actions";
import {
  Network,
  Search,
  CreditCard,
  Settings,
  Zap,
  List,
  TrendingUp
} from "lucide-react";
import { Icon } from "@/shared/ui";

/**
 * Specialized Dashboard for Recruiters.
 * Focused on candidate pipelines and sourcing metrics.
 */
export default function RecruiterDashboardPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getRecruiterProfileAction();
      if (!data.error) {
        setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="bg-bg text-text min-h-screen transition-colors">
      
      {/* Dashboard Header */}
      <header className="border-b border-border px-6 py-4 items-center sticky z-50 flex top-0 bg-surface justify-between md:px-12">
        <div className="flex gap-6 items-center">
          <Link href="/recruiter/dashboard" className="text-primary items-center gap-2 flex transition-opacity hover:opacity-90">
            <Network size={28} aria-hidden="true" />
            <span className="text-2xl tracking-tight font-bold">JobLyne</span>
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <span className="px-2 text-primary py-1 type-badge rounded bg-primary/10">Recruiter Portal</span>
        </div>
        <div className="gap-4 flex items-center">
          <button className="justify-center min-h-[44px] items-center p-2 transition-colors flex min-w-[44px] text-muted hover:text-primary cursor-pointer">
            <Search size={20} aria-hidden="true" />
          </button>
          <Link 
            href="/recruiter/billing" 
            className="justify-center min-h-[44px] items-center p-2 transition-colors flex min-w-[44px] text-muted hover:text-primary"
            title="Billing & Wallet"
          >
            <CreditCard size={20} aria-hidden="true" />
          </Link>
          <Link 
            href="/recruiter/settings" 
            className="justify-center min-h-[44px] items-center p-2 transition-colors flex min-w-[44px] text-muted hover:text-primary"
            title="Settings"
          >
            <Settings size={20} aria-hidden="true" />
          </Link>
          <div className="flex gap-3 items-center">
             {profile?.profile_photo_url ? (
               <img 
                 src={profile.profile_photo_url} 
                 alt={`${profile?.first_name || "Recruiter"}'s avatar`} 
                 className="object-cover border-border rounded-full size-10 border"
               />
             ) : (
               <div className="justify-center items-center rounded-full bg-primary flex size-10 text-white font-semibold">
                 {profile?.first_name ? profile.first_name.substring(0, 2).toUpperCase() : "RC"}
               </div>
             )}
             <button 
               onClick={() => logoutAction()} 
               className="px-2 uppercase min-h-[44px] items-center transition-colors tracking-wider flex type-caption text-muted hover:text-red-500 cursor-pointer"
             >
               Logout
             </button>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-8 max-w-7xl p-6 md:p-12">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-text type-h1">
            Welcome back, {profile?.first_name || "Recruiter"}!
          </h1>
          <p className="text-muted">
            Manage your candidate pipelines and sourcing performance{profile?.agency_name ? ` at ${profile.agency_name}` : ""}.
          </p>
        </div>

        <section className="gap-6 grid grid-cols-1 md:grid-cols-4">
          {[
            { label: "Total Candidates", value: "1,284", icon: "person", color: "text-blue-500" },
            { label: "Active Pipelines", value: "12", icon: "reorder", color: "text-primary" },
            { label: "Interviewed", value: "45", icon: "event", color: "text-green-500" },
            { label: "Placements", value: "8", icon: "verified", color: "text-orange-500" },
          ].map((stat, i) => (
            <div key={i} className="border-border rounded-2xl shadow-sm p-6 bg-surface border">
              <Icon name={stat.icon} className={`mb-2 ${stat.color}`} size={24} aria-hidden="true" />
              <h4 className="text-text type-h2">{stat.value}</h4>
              <p className="uppercase tracking-widest type-caption text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border-border rounded-2xl space-y-6 p-8 bg-surface border">
            <h3 className="type-h3 text-text">Quick Sourcing</h3>
            <div className="space-y-4">
              <button className="w-full border-border gap-4 group items-center transition-all flex p-4 text-left rounded-xl border hover:border-primary cursor-pointer">
                <Zap className="text-primary transition-transform group-hover:scale-110" size={20} aria-hidden="true" />
                <div>
                  <h4 className="text-text">AI Talent Match</h4>
                  <p className="text-xs text-muted">Find the 1% for your active jobs instantly.</p>
                </div>
              </button>
              <button className="w-full border-border gap-4 group items-center transition-all flex p-4 text-left rounded-xl border hover:border-primary cursor-pointer">
                <List className="text-primary transition-transform group-hover:scale-110" size={20} aria-hidden="true" />
                <div>
                  <h4 className="text-text">Browse Pre-vetted Talent</h4>
                  <p className="text-xs text-muted">Explore specialists ready to be interviewed.</p>
                </div>
              </button>
            </div>
          </div>
          
          <div className="text-text rounded-2xl relative border-primary/20 border-2 overflow-hidden bg-primary/5 p-8 space-y-4">
            <h3 className="type-h3 text-primary">Recruiter Intelligence</h3>
            <p className="leading-relaxed text-sm text-muted">
              Your placement rate is 12% higher than the platform average this month! Keep it up to earn the "Top Tier Sourced" badge.
            </p>
            <button className="px-6 transition-all py-3 text-white rounded-xl bg-btn-primary hover:bg-btn-primary-hover cursor-pointer">
              View Analytics
            </button>
            <TrendingUp className="-right-4 absolute text-primary/10 -bottom-4" size={96} aria-hidden="true" />
          </div>
        </section>

      </main>
    </div>
  );
}
