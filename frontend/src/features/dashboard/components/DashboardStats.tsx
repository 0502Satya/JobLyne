import React from "react";
import { TrendingUp, TrendingDown, Eye, Send, CalendarDays } from "lucide-react";
import { DashboardStats as DashboardStatsType } from "@/types/profile";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
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

  return (
    <div className="mb-10 gap-6 grid grid-cols-1 md:grid-cols-3 text-left">
      {/* Profile Views */}
      <div className="border-border/60 group items-start shadow-sm transition-all duration-300 p-6 justify-between flex bg-surface rounded-2xl border hover:shadow-md hover:-translate-y-1 hover:border-primary/30">
        <div className="space-y-1">
          <p className="tracking-tight text-xs uppercase font-bold text-muted">Profile views</p>
          <h3 className="text-text text-3xl font-extrabold tracking-tight">{stats.profile_views.toLocaleString()}</h3>
          {stats.profile_views > 0 ? (
            <p className={`mt-2 items-center flex text-xs font-semibold ${
              stats.profile_views_change >= 0 ? "text-success" : "text-error"
            }`}>
              {stats.profile_views_change >= 0 ? (
                <TrendingUp size={14} className="mr-1" aria-hidden="true" />
              ) : (
                <TrendingDown size={14} className="mr-1" aria-hidden="true" />
              )}
              {stats.profile_views_change >= 0 ? "+" : ""}{stats.profile_views_change}% this week
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted font-medium">No views this week</p>
          )}
        </div>
        <div className="rounded-2xl text-info p-3 bg-info-bg/30 border border-info/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Eye size={22} aria-hidden="true" />
        </div>
      </div>

      {/* Applications */}
      <div className="border-border/60 group items-start shadow-sm transition-all duration-300 p-6 justify-between flex bg-surface rounded-2xl border hover:shadow-md hover:-translate-y-1 hover:border-primary/30">
        <div className="space-y-1">
          <p className="tracking-tight text-xs uppercase font-bold text-muted">Applications</p>
          <h3 className="text-text text-3xl font-extrabold tracking-tight">{stats.applications}</h3>
          <p className="mt-2 text-xs text-muted font-medium">
            {stats.pending_applications > 0 
              ? `${stats.pending_applications} pending review` 
              : "No pending applications"}
          </p>
        </div>
        <div className="rounded-2xl text-primary p-3 bg-primary/10 border border-primary/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Send size={22} aria-hidden="true" />
        </div>
      </div>

      {/* Interviews */}
      <div className="border-border/60 group items-start shadow-sm transition-all duration-300 p-6 justify-between flex bg-surface rounded-2xl border hover:shadow-md hover:-translate-y-1 hover:border-primary/30">
        <div className="space-y-1">
          <p className="tracking-tight text-xs uppercase font-bold text-muted">Interviews</p>
          <h3 className="text-text text-3xl font-extrabold tracking-tight">{stats.interviews}</h3>
          <p className="mt-2 text-xs text-muted font-medium">
            {stats.next_interview_time 
              ? `Next: ${formatInterviewTime(stats.next_interview_time)}` 
              : "No scheduled interviews"}
          </p>
        </div>
        <div className="bg-warning-bg/30 border border-warning/20 rounded-2xl p-3 text-warning shadow-sm transition-transform duration-300 group-hover:scale-110">
          <CalendarDays size={22} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
