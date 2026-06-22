"use client";

import React, { useEffect, useState } from "react";
import { getDashboardStatsAction } from "@/features/auth/actions";
import { TrendingUp, Eye, Send, CalendarDays } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    applications: 0,
    profile_views: 0,
    interviews: 0
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
          <p className="tracking-tight type-label uppercase mb-1 font-semibold">Profile Views</p>
          <h3 className="text-text type-h2 font-bold">{stats.profile_views.toLocaleString()}</h3>
          <p className="mt-2 items-center text-success flex type-caption font-semibold">
            <TrendingUp size={14} className="mr-1 font-bold" aria-hidden="true" /> +12% this week
          </p>
        </div>
        <div className="rounded-xl text-info p-3 bg-info-bg border border-info/10">
          <Eye size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>

      {/* Applications */}
      <div className="border-border group items-start shadow-sm transition-shadow p-6 justify-between flex bg-surface rounded-xl border hover:shadow-md">
        <div>
          <p className="tracking-tight type-label uppercase mb-1 font-semibold">Applications</p>
          <h3 className="text-text type-h2 font-bold">{stats.applications}</h3>
          <p className="mt-2 type-caption text-muted font-medium">3 pending review</p>
        </div>
        <div className="rounded-xl text-primary p-3 bg-primary/10 border border-primary/5">
          <Send size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>

      {/* Interviews */}
      <div className="border-border group items-start shadow-sm transition-shadow p-6 justify-between flex bg-surface rounded-xl border hover:shadow-md">
        <div>
          <p className="tracking-tight type-label uppercase mb-1 font-semibold">Interviews</p>
          <h3 className="text-text type-h2 font-bold">{stats.interviews}</h3>
          <p className="mt-2 type-caption text-muted font-medium">Next: Tomorrow, 2:00 PM</p>
        </div>
        <div className="bg-warning-bg border border-warning/10 rounded-xl p-3 text-warning">
          <CalendarDays size={20} className="font-bold" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
