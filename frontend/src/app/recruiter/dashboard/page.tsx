"use client";

import React from "react";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";

/**
 * Specialized Dashboard for Recruiters.
 * Focused on candidate pipelines and sourcing metrics.
 */
export default function RecruiterDashboardPage() {
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
          <button className="p-2 text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="flex items-center gap-3">
             <div className="size-10 bg-primary rounded-full flex items-center justify-center text-surface font-bold">AB</div>
             <button onClick={() => logoutAction()} className="text-xs font-bold text-muted hover:text-red-500 transition-colors uppercase tracking-wider">Logout</button>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-text">Recruiter Dashboard</h1>
          <p className="text-muted">Manage your candidate pipelines and sourcing performance.</p>
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
