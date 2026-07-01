"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Building2, Users, Briefcase, ClipboardList, 
  ArrowUpRight, AlertTriangle, ShieldCheck, Clock
} from "lucide-react";
import { getAdminStatsAction } from "@/features/admin/actions";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const res = await getAdminStatsAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        setStats(res);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Companies",
      value: stats?.companies?.total || 0,
      icon: Building2,
      color: "text-blue-400 bg-blue-950/40 border-blue-900/50",
      description: `${stats?.companies?.verified || 0} Verified • ${stats?.companies?.pending || 0} Pending`
    },
    {
      label: "Total Candidates",
      value: stats?.candidates?.total || 0,
      icon: Users,
      color: "text-indigo-400 bg-indigo-950/40 border-indigo-900/50",
      description: `+${stats?.candidates?.new_today || 0} registered today`
    },
    {
      label: "Active Openings",
      value: stats?.jobs?.active || 0,
      icon: Briefcase,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/50",
      description: "Live job postings"
    },
    {
      label: "Verification Queue",
      value: stats?.companies?.pending || 0,
      icon: ShieldCheck,
      color: stats?.companies?.pending > 0 ? "text-amber-400 bg-amber-950/40 border-amber-900/50 animate-pulse" : "text-slate-400 bg-slate-900/40 border-slate-800/50",
      description: stats?.companies?.pending > 0 ? "URGENT review needed" : "Queue is empty"
    }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Control Overview</h1>
        <p className="text-slate-400 text-xs mt-1">Platform telemetry metrics, pending verification alerts, and system audit trail.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`bg-slate-900/80 border p-6 rounded-2xl shadow-lg shadow-slate-950/50 flex flex-col justify-between ${kpi.color.split(" ")[2]}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">{kpi.label}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white leading-none block">{kpi.value}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">{kpi.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification alerts */}
      {stats?.companies?.pending > 0 && (
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="justify-center size-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center text-amber-400 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="text-amber-200 font-extrabold text-sm">Action required in verification queue</h4>
              <p className="text-slate-400 text-[11px] max-w-xl">
                There are {stats.companies.pending} workspace registrations pending. Verification officers must review document records to secure applicant confidence.
              </p>
            </div>
          </div>
          <Link 
            href="/admin/verification" 
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <span>Process Queue</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Two Column details row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" /> System Actions Trail
            </h3>
            <Link href="/admin/logs" className="text-primary font-bold hover:underline text-[11px] flex items-center gap-1">
              View all audit logs <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.logs && stats.logs.length > 0 ? (
              stats.logs.map((log: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start p-4 bg-slate-950/40 rounded-xl border border-slate-800/40 hover:border-slate-800/80 transition-colors">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                      {log.actor} • {log.entity}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200">
                      {log.action.replace("_", " ")} {log.notes ? `— ${log.notes}` : ""}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
                    <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">No recent actions recorded.</div>
            )}
          </div>
        </div>

        {/* Platform info */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/60 pb-4 flex items-center gap-2">
            📊 Registration Yield Info
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Verified Employers Ratio</span>
                <span>
                  {stats?.companies?.total ? Math.round((stats.companies.verified / stats.companies.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/40">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${stats?.companies?.total ? (stats.companies.verified / stats.companies.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Pending Queue Load</span>
                <span>
                  {stats?.companies?.total ? Math.round((stats.companies.pending / stats.companies.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/40">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${stats?.companies?.total ? (stats.companies.pending / stats.companies.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-[10px] text-slate-400 space-y-2 text-left leading-relaxed">
              <div className="font-bold uppercase tracking-wider text-slate-200">System Checklist Toggles</div>
              <div>• Enable new user registrations: <span className="text-emerald-400 font-bold">ACTIVE</span></div>
              <div>• Corporate verification gate: <span className="text-emerald-400 font-bold">ENFORCED</span></div>
              <div>• Global recruiter matching engine: <span className="text-emerald-400 font-bold">STABLE</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
