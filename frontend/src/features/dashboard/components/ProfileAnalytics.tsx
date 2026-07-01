"use client";

import React, { useEffect, useState } from "react";
import { Eye, CalendarDays, BarChart3, Clock, RefreshCw, Award, Compass } from "lucide-react";
import { getProfileAnalyticsAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";

export default function ProfileAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await getProfileAnalyticsAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        setData(res);
      }
    } catch (err) {
      toast.error("Failed to load profile analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds to capture views live
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastViewed = (dateStr: string | null) => {
    if (!dateStr) return "Never viewed";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border/60 rounded-2xl p-6 animate-pulse space-y-4 text-left">
        <div className="h-5 bg-border/60 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-border/30 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-6 text-left shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Title & Refresh control */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-primary size-5" />
          <h2 className="text-text type-card-title font-bold">Profile Analytics</h2>
        </div>
        <button 
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg border border-border/60 hover:bg-bg/40 text-muted hover:text-text cursor-pointer transition-colors disabled:opacity-50"
          title="Refresh statistics"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Views */}
        <div className="bg-bg/30 border border-border/40 rounded-2xl p-4.5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Total Views</span>
            <span className="text-2xl font-extrabold text-text">{data?.totalViews ?? 0}</span>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/10">
            <Eye size={20} />
          </div>
        </div>

        {/* Weekly Views */}
        <div className="bg-bg/30 border border-border/40 rounded-2xl p-4.5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Views This Week</span>
            <span className="text-2xl font-extrabold text-text">{data?.weeklyViews ?? 0}</span>
          </div>
          <div className="p-2.5 bg-success-bg/30 rounded-xl text-success border border-success/10">
            <Award size={20} />
          </div>
        </div>

        {/* Monthly Views */}
        <div className="bg-bg/30 border border-border/40 rounded-2xl p-4.5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Views This Month</span>
            <span className="text-2xl font-extrabold text-text">{data?.monthlyViews ?? 0}</span>
          </div>
          <div className="p-2.5 bg-info-bg/30 rounded-xl text-info border border-info/10">
            <CalendarDays size={20} />
          </div>
        </div>

        {/* Last Viewed */}
        <div className="bg-bg/30 border border-border/40 rounded-2xl p-4.5 flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Last Viewed</span>
            <span className="text-xs font-bold text-text truncate block">{formatLastViewed(data?.lastViewed)}</span>
          </div>
          <div className="p-2.5 bg-warning-bg/30 rounded-xl text-warning border border-warning/10 shrink-0">
            <Clock size={20} />
          </div>
        </div>

      </div>

      {/* Recent Companies viewed profile */}
      <div className="pt-4 border-t border-border/50 space-y-3">
        <div className="flex items-center gap-1.5">
          <Compass className="text-indigo-400 size-4" />
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Companies</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data?.recentCompanies && data.recentCompanies.length > 0 ? (
            data.recentCompanies.map((company: string, idx: number) => (
              <span 
                key={idx}
                className="px-3.5 py-1.5 bg-bg border border-border/70 hover:border-primary/40 rounded-xl text-xs font-bold text-text transition-all"
              >
                {company}
              </span>
            ))
          ) : (
            <p className="text-xs text-muted font-semibold">No company has viewed your profile yet. Apply to jobs to start gaining visibility!</p>
          )}
        </div>
      </div>

    </div>
  );
}
