"use client";

import React, { useEffect, useState } from "react";
import { getDashboardStatsAction } from "@/features/auth/actions";
import { TrendingUp, TrendingDown, Eye, Send, CalendarDays } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    applications: 0,
    pending_applications: 0,
    profile_views: 0,
    profile_views_change: 0,
    interviews: 0,
    next_interview_time: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStatsAction();
      if (!data.error) {
        setStats(data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const formatInterviewTime = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }
  };

  if (loading) {
    return (
      <div className="mb-10 gap-6 grid grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 border-border animate-pulse bg-surface rounded-xl border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-10 gap-6 grid grid-cols-1 md:grid-cols-3 text-left">
      {/* Profile Views */}
      <div className="border-border group items-start shadow-sm transition-shadow p-6 justify-between flex bg-surface rounded-xl border hover:shadow-md">
        <div>
          <p className="tracking-tight type-label mb-1 font-semibold">Profile views</p>
          <h3 className="text-text type-h2 font-bold">{stats.profile_views.toLocaleString()}</h3>
          {stats.profile_views > 0 ? (
            <p className={`mt-2 items-center flex type-caption font-semibold ${
              stats.profile_views_change >= 0 ? "text-success" : "text-error"
            }`}>
              {stats.profile_views_change >= 0 ? (
                <TrendingUp size={14} className="mr-1 font-bold" aria-hidden="true" />
              ) : (
                <TrendingDown size={14} className="mr-1 font-bold" aria-hidden="true" />
              )}
              {stats.profile_views_change >= 0 ? "+" : ""}{stats.profile_views_change}% this week
            </p>
          ) : (
            <p className="mt-2 type-caption text-muted font-medium">No views this week</p>
          )}
        </div>
        <div className="rounded-xl text-info p-3 bg-info-bg border border-info/10">
          <Eye size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>

      {/* Applications */}
      <div className="border-border group items-start shadow-sm transition-shadow p-6 justify-between flex bg-surface rounded-xl border hover:shadow-md">
        <div>
          <p className="tracking-tight type-label mb-1 font-semibold">Applications</p>
          <h3 className="text-text type-h2 font-bold">{stats.applications}</h3>
          <p className="mt-2 type-caption text-muted font-medium">
            {stats.pending_applications > 0 
              ? `${stats.pending_applications} pending review` 
              : "No pending applications"}
          </p>
        </div>
        <div className="rounded-xl text-primary p-3 bg-primary/10 border border-primary/5">
          <Send size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>

      {/* Interviews */}
      <div className="border-border group items-start shadow-sm transition-shadow p-6 justify-between flex bg-surface rounded-xl border hover:shadow-md">
        <div>
          <p className="tracking-tight type-label mb-1 font-semibold">Interviews</p>
          <h3 className="text-text type-h2 font-bold">{stats.interviews}</h3>
          <p className="mt-2 type-caption text-muted font-medium">
            {stats.next_interview_time 
              ? `Next: ${formatInterviewTime(stats.next_interview_time)}` 
              : "No scheduled interviews"}
          </p>
        </div>
        <div className="bg-warning-bg border border-warning/10 rounded-xl p-3 text-warning">
          <CalendarDays size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
