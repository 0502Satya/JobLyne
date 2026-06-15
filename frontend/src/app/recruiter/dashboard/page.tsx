"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction, getRecruiterProfileAction } from "@/features/auth/actions";

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
    <div className="min-h-screen bg-bg text-text transition-colors">
      
      {/* Dashboard Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-xl">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Recruiter Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-muted hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link 
            href="/recruiter/billing" 
            className="p-2 text-muted hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Billing & Wallet"
          >
            <span className="material-symbols-outlined">credit_card</span>
          </Link>
          <Link 
            href="/recruiter/settings" 
            className="p-2 text-muted hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <div className="flex items-center gap-3">
             {profile?.profile_photo_url ? (
               <img 
                 src={profile.profile_photo_url} 
                 alt="Avatar" 
                 className="size-10 rounded-full object-cover border border-border"
               />
             ) : (
               <div className="size-10 bg-primary rounded-full flex items-center justify-center text-surface font-bold">
                 {profile?.first_name ? profile.first_name.substring(0, 2).toUpperCase() : "RC"}
               </div>
             )}
             <button 
               onClick={() => logoutAction()} 
               className="text-xs font-bold text-muted hover:text-red-500 transition-colors uppercase tracking-wider min-h-[44px] px-2 flex items-center"
             >
               Logout
             </button>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-text">
            Welcome back, {profile?.first_name || "Recruiter"}!
          </h1>
          <p className="text-muted">
            Manage your candidate pipelines and sourcing performance{profile?.agency_name ? ` at ${profile.agency_name}` : ""}.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Candidates", value: "1,284", icon: "person", color: "text-blue-500" },
            { label: "Active Pipelines", value: "12", icon: "reorder", color: "text-primary" },
            { label: "Interviewed", value: "45", icon: "event", color: "text-green-500" },
            { label: "Placements", value: "8", icon: "verified", color: "text-orange-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <span className={`material-symbols-outlined mb-2 ${stat.color}`}>{stat.icon}</span>
              <h4 className="text-2xl font-black text-text">{stat.value}</h4>
              <p className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-text">Quick Sourcing</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary transition-all text-left group">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">bolt</span>
                <div>
                  <h4 className="font-bold text-text">AI Talent Match</h4>
                  <p className="text-xs text-muted">Find the 1% for your active jobs instantly.</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary transition-all text-left group">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">list</span>
                <div>
                  <h4 className="font-bold text-text">Browse Pre-vetted Talent</h4>
                  <p className="text-xs text-muted">Explore specialists ready to be interviewed.</p>
                </div>
              </button>
            </div>
          </div>
          
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 text-text space-y-4 relative overflow-hidden">
            <h3 className="text-xl font-bold text-primary">Recruiter Intelligence</h3>
            <p className="text-muted text-sm leading-relaxed">
              Your placement rate is 12% higher than the platform average this month! Keep it up to earn the "Top Tier Sourced" badge.
            </p>
            <button className="bg-btn-primary text-surface font-bold px-6 py-3 rounded-xl hover:bg-btn-primary-hover transition-all">
              View Analytics
            </button>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-primary/10">insights</span>
          </div>
        </section>

      </main>
    </div>
  );
}
