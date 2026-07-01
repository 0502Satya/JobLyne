"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Briefcase, Search, Filter, ShieldCheck, Mail, 
  MapPin, Flag, Trash2, CheckCircle2, Clock
} from "lucide-react";
import { 
  getAdminJobsAction, 
  moderateJobAction 
} from "@/features/admin/actions";
import { Dialog, Button } from "@/shared/ui";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Moderate action states
  const [targetJob, setTargetJob] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    const statusVal = statusFilter === "All" ? "" : statusFilter.toUpperCase();
    const res = await getAdminJobsAction(search, statusVal);
    if (res.error) {
      toast.error(res.error);
    } else {
      setJobs(Array.isArray(res) ? res : (res?.results || []));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleOpenAction = (job: any, action: "flag" | "remove") => {
    setTargetJob({ ...job, actionType: action });
    setNotes("");
  };

  const handleModerateSubmit = async () => {
    if (!targetJob) return;
    
    setActionLoading(true);
    const res = await moderateJobAction(targetJob.id, targetJob.actionType, notes);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Job posting ${targetJob.actionType === "flag" ? "flagged back to draft" : "removed from system"} successfully.`);
      setTargetJob(null);
      fetchJobs();
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Jobs moderation</h1>
        <p className="text-slate-400 text-xs mt-1">Audit active openings, flag scam submissions, and clear expired listings.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by job title or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-600"
          />
          <button 
            type="submit" 
            className="h-10 px-4 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1 hover:opacity-90 cursor-pointer"
          >
            <Search size={14} /> Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-primary"
          >
            <option value="All">All Job Statuses</option>
            <option value="Open">Active / Open</option>
            <option value="Draft">Draft Openings</option>
            <option value="Closed">Archived / Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Opening Title</th>
                <th className="py-4 px-6">Hiring Company</th>
                <th className="py-4 px-6">Work Mode</th>
                <th className="py-4 px-6">Compensation</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">No active job listings found.</td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{j.title}</td>
                    <td className="py-4 px-6 font-semibold">{j.company_name}</td>
                    <td className="py-4 px-6 font-mono text-[10px]">{j.employment_type}</td>
                    <td className="py-4 px-6 font-medium">
                      {j.salary_min !== 'N/A' ? `${j.salary_min} - ${j.salary_max}` : "Undisclosed"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        j.status === "OPEN" ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" :
                        j.status === "DRAFT" ? "text-amber-400 bg-amber-950/20 border-amber-900/50" :
                        "text-slate-400 bg-slate-950/20 border-slate-900/50"
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 shrink-0">
                      {j.status === "OPEN" && (
                        <button 
                          onClick={() => handleOpenAction(j, "flag")}
                          className="px-2.5 py-1.5 bg-transparent border border-amber-950 text-amber-500 rounded-lg text-[10px] font-bold hover:bg-amber-950/25 cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Flag size={12} /> Flag Draft
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenAction(j, "remove")}
                        className="px-2.5 py-1.5 bg-transparent border border-red-950 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-950/25 cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Dialog */}
      {targetJob && (
        <Dialog isOpen={true} onClose={() => setTargetJob(null)} title="Job Moderation Action" size="md">
          <div className="space-y-5 text-left">
            <div>
              <h4 className="text-sm font-bold text-white">Moderate: {targetJob.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{targetJob.company_name}</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Reason notes</label>
              <textarea
                placeholder="Brief reason explaining why this posting is flagged or removed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                onClick={() => setTargetJob(null)} 
                variant="secondary" 
                className="px-4 py-2 text-xs font-bold border-slate-850"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleModerateSubmit}
                disabled={actionLoading}
                variant="danger" 
                className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white"
              >
                {actionLoading ? "Processing..." : `Confirm ${targetJob.actionType === "flag" ? "Flag" : "Removal"}`}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

    </div>
  );
}
