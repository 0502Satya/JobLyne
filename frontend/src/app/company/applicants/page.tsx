"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { 
  getApplicantsAction, 
  bulkUpdateApplicantStatusAction, 
  scheduleInterviewAction, 
  compareCandidatesAction 
} from "@/features/company/actions";

interface Application {
  id: string;
  job: string;
  job_title: string;
  company_name: string;
  status: "PENDING" | "INTERVIEW" | "OFFER" | "PLACED" | "REJECTED" | string;
  applied_at: string;
  updated_at: string;
  interview_schedule?: string;
  cover_letter?: string;
  rejection_reason?: string;
  candidate_id: string;
  candidate_user_id?: string;
  candidate_name: string;
  candidate_headline: string;
  candidate_skills: string[];
  candidate_email: string;
  candidate_phone: string;
  candidate_experience: number;
  candidate_resume?: string;
}

export default function CompanyApplicantsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [jobFilter, setJobFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Compare Modal
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[] | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Interview Scheduler Modal
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await getApplicantsAction();
      if (res.error) {
        setError(res.error);
      } else {
        setApplications(res || []);
      }
    } catch (err) {
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bulk Actions
  const handleBulkStatusUpdate = async (newStatus: "INTERVIEW" | "OFFER" | "PLACED" | "REJECTED") => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    const res = await bulkUpdateApplicantStatusAction(selectedIds, newStatus, `Bulk action: ${newStatus}`);
    if (res.error) {
      alert(res.error);
    } else {
      setSelectedIds([]);
      await loadData();
    }
  };

  // Drag-and-drop or select stage transitions for Kanban
  const transitionStage = async (appId: string, newStatus: string) => {
    setLoading(true);
    const res = await bulkUpdateApplicantStatusAction([appId], newStatus, `Stage changed in Kanban.`);
    if (res.error) {
      alert(res.error);
    } else {
      await loadData();
    }
  };

  // Compare candidates trigger
  const handleCompareTrigger = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    // Find candidate IDs of selected applications
    const candidateIds = applications
      .filter(app => selectedIds.includes(app.id))
      .map(app => app.candidate_id);

    const data = await compareCandidatesAction(candidateIds);
    setLoading(false);
    if (data.error) {
      alert(data.error);
    } else {
      setCompareData(data);
      setShowCompareModal(true);
    }
  };

  // Interview Scheduler Trigger
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingAppId || !interviewDate) return;
    setLoading(true);
    const res = await scheduleInterviewAction(schedulingAppId, interviewDate);
    if (res.error) {
      alert(res.error);
    } else {
      setShowSchedulerModal(false);
      setSchedulingAppId(null);
      setInterviewDate("");
      await loadData();
    }
  };

  // Distinct jobs in applications pool for filtering
  const distinctJobs = Array.from(new Set(applications.map(a => a.job_title))).filter(Boolean);

  // Filter pipeline
  const filteredApps = applications.filter(app => {
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchesJob = jobFilter === "ALL" || app.job_title === jobFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      app.candidate_name.toLowerCase().includes(term) ||
      (app.candidate_headline || "").toLowerCase().includes(term) ||
      app.candidate_skills.some(s => s.toLowerCase().includes(term));
    return matchesStatus && matchesJob && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Loading Applicants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans transition-colors">
      
      {/* Sticky Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/company" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hidden md:inline-block">Company Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/company" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Dashboard
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <Link href="/company/team" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">group</span>
            Team
          </Link>
          <button 
            onClick={() => logoutAction()} 
            className="text-xs font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/5 active:scale-[0.98] min-h-[44px]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-8">
        
        {/* Welcome Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">Applicant Tracking Pipelines</h1>
            <p className="text-muted text-sm font-semibold">Vet developer applications, schedule interviews, and select matches.</p>
          </div>
          
          {/* View Toggles */}
          <div className="flex bg-surface border border-border p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                viewMode === "list" ? "bg-primary text-surface shadow-md" : "text-muted hover:text-text"
              }`}
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              List view
            </button>
            <button 
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                viewMode === "kanban" ? "bg-primary text-surface shadow-md" : "text-muted hover:text-text"
              }`}
            >
              <span className="material-symbols-outlined text-base">view_week</span>
              Kanban Board
            </button>
          </div>
        </div>

        {/* Filter Operations */}
        <section className="bg-surface border border-border p-6 rounded-card shadow-sm flex flex-col md:flex-row gap-4 flex-wrap items-center">
          
          {/* Sourcing Query */}
          <div className="relative flex-1 min-w-[240px] w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query name, skills, title..."
              className="w-full pl-12 pr-4 py-3.5 bg-bg border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-xs min-h-[48px]"
            />
          </div>

          {/* Job select filter */}
          <div className="w-full md:w-56">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full p-3.5 bg-bg border border-border rounded-2xl font-semibold text-xs min-h-[48px] outline-none cursor-pointer"
            >
              <option value="ALL">All Jobs</option>
              {distinctJobs.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>

          {/* Status select filter (List view only) */}
          {viewMode === "list" && (
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3.5 bg-bg border border-border rounded-2xl font-semibold text-xs min-h-[48px] outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="INTERVIEW">Interviewing</option>
                <option value="OFFER">Offered</option>
                <option value="PLACED">Placed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}

        </section>

        {/* Bulk action drawer */}
        {selectedIds.length > 0 && viewMode === "list" && (
          <div className="bg-gradient-to-r from-primary to-[#4c33cf] text-surface p-4 rounded-3xl flex flex-wrap justify-between items-center gap-4 animate-in slide-in-from-bottom-6 duration-300">
            <span className="text-xs font-black uppercase tracking-wider pl-2">{selectedIds.length} Applicants Selected</span>
            <div className="flex gap-2.5">
              <button 
                onClick={handleCompareTrigger}
                className="px-4 py-2 bg-surface text-primary font-black text-xs rounded-xl hover:scale-105 active:scale-98 transition-all min-h-[40px]"
              >
                Compare Side-by-Side
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate("INTERVIEW")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-surface border border-white/20 font-black text-xs rounded-xl hover:scale-105 active:scale-98 transition-all min-h-[40px]"
              >
                Shortlist (Interview)
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate("REJECTED")}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 text-surface font-black text-xs rounded-xl hover:scale-105 active:scale-98 transition-all min-h-[40px]"
              >
                Bulk Reject
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Display Panel */}
        {viewMode === "list" ? (
          /* List View Representation */
          <div className="bg-surface border border-border rounded-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredApps.length}
                        onChange={toggleSelectAll}
                        className="cursor-pointer size-4"
                      />
                    </th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Candidate</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Job Position</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Vetting skills</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Experience</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Status</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-bg/10 transition-colors">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="cursor-pointer size-4"
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-sm text-text leading-tight">{app.candidate_name}</h4>
                          <p className="text-[10px] text-muted font-semibold leading-normal truncate max-w-xs">{app.candidate_headline || "Software Engineer"}</p>
                          <div className="flex gap-2 text-[10px] text-slate-500 font-medium">
                            <a href={`mailto:${app.candidate_email}`} className="hover:underline">{app.candidate_email}</a>
                            <span>&bull;</span>
                            <span>{app.candidate_phone || "Not provided"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold">{app.job_title}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.candidate_skills.slice(0, 3).map((s, i) => (
                            <span key={i} className="bg-bg text-text font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-border">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold">{app.candidate_experience ?? 3} Years</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          app.status === "PENDING" ? "bg-blue-500/10 text-blue-500" :
                          app.status === "INTERVIEW" ? "bg-warning/10 text-warning" :
                          app.status === "OFFER" ? "bg-purple-500/10 text-purple-500" :
                          app.status === "PLACED" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}>{app.status}</span>
                        {app.interview_schedule && app.status === "INTERVIEW" && (
                          <div className="text-[10px] text-amber-500 font-bold mt-1">
                            Slot: {new Date(app.interview_schedule).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSchedulingAppId(app.id);
                            setShowSchedulerModal(true);
                          }}
                          className="px-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-surface font-black text-[10px] uppercase rounded-xl transition-all min-h-[44px]"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={async () => {
                            const { startThreadAction } = await import("@/features/auth/actions");
                            const res = await startThreadAction(app.candidate_user_id || "");
                            if (res.thread_id) {
                              router.push(`/company/messages?thread=${res.thread_id}`);
                            } else {
                              alert("Cannot start direct chat. No user account linked.");
                            }
                          }}
                          className="px-3 py-2 bg-surface hover:bg-bg border border-border text-text font-black text-[10px] uppercase rounded-xl transition-all min-h-[44px]"
                        >
                          Chat
                        </button>
                        {app.candidate_resume && (
                          <a
                            href={app.candidate_resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-2 bg-surface border border-border text-muted hover:text-text font-black text-[10px] uppercase rounded-xl transition-all min-h-[44px]"
                          >
                            Resume
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredApps.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-muted font-semibold text-sm">
                        No applicants found matching current filter preferences.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Board Representation */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {(["PENDING", "INTERVIEW", "OFFER", "PLACED"] as const).map(stage => {
              const stageApps = filteredApps.filter(a => a.status === stage);
              return (
                <div key={stage} className="bg-surface border border-border rounded-card p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/60">
                    <h4 className="font-black text-sm text-text uppercase tracking-wider">
                      {stage === "PENDING" ? "Sourced" : stage === "INTERVIEW" ? "Interviewing" : stage === "OFFER" ? "Offered" : "Placed"}
                    </h4>
                    <span className="bg-bg text-muted font-black text-xs px-2.5 py-0.5 rounded-full">{stageApps.length}</span>
                  </div>
                  <div className="space-y-3 min-h-[250px]">
                    {stageApps.map(app => (
                      <div key={app.id} className="bg-bg border border-border/80 p-4 rounded-2xl hover:border-primary/40 transition-all space-y-3 relative group shadow-sm">
                        <div className="space-y-1">
                          <h5 className="font-black text-sm text-text leading-tight">{app.candidate_name}</h5>
                          <p className="text-[10px] text-muted font-semibold truncate leading-tight">{app.candidate_headline || "Candidate"}</p>
                          <p className="text-[9px] text-slate-500 font-extrabold uppercase">{app.job_title.split(" ")[0]}</p>
                        </div>
                        {app.candidate_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.candidate_skills.slice(0, 2).map((s, idx) => (
                              <span key={idx} className="bg-surface text-muted font-black text-[8px] uppercase px-1.5 py-0.5 rounded-full border border-border">{s}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-border/50">
                          <button
                            onClick={() => {
                              setSchedulingAppId(app.id);
                              setShowSchedulerModal(true);
                            }}
                            className="text-[10px] font-black text-primary hover:underline"
                          >
                            Schedule
                          </button>
                          
                          {/* Transition Select Menu */}
                          <select
                            value={app.status}
                            onChange={(e) => transitionStage(app.id, e.target.value)}
                            className="bg-surface border border-border text-[9px] font-black uppercase rounded-lg px-2 py-1 outline-none cursor-pointer text-muted hover:text-text"
                          >
                            <option value="PENDING">Sourced</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="PLACED">Placed</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {stageApps.length === 0 && (
                      <div className="border border-dashed border-border/60 rounded-2xl p-8 text-center text-xs text-muted font-semibold flex flex-col justify-center items-center min-h-[150px]">
                        <span className="material-symbols-outlined text-border mb-2 text-2xl">drag_indicator</span>
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL 1: Candidate Comparison Side-by-Side */}
      {showCompareModal && compareData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowCompareModal(false); setCompareData(null); }}
              className="absolute top-6 right-6 p-2 text-muted hover:text-text hover:bg-bg rounded-xl min-h-[40px]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-1 mb-8">
              <h3 className="text-2xl font-black tracking-tight text-text">Candidate Comparison Matrix</h3>
              <p className="text-muted text-sm font-semibold">Side-by-side comparative analysis of selected shortlisted developers.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {compareData.map((cand) => (
                <div key={cand.id} className="bg-bg border border-border rounded-3xl p-6 space-y-5 shadow-sm">
                  <div className="space-y-2 text-center pb-4 border-b border-border/80">
                    <div className="size-16 rounded-full bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
                      {cand.full_name?.substring(0, 2).toUpperCase() || "CN"}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-text leading-tight">{cand.full_name || "Candidate"}</h4>
                      <p className="text-xs text-muted font-bold mt-0.5">{cand.headline || "Developer"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-text">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Sourcing details</span>
                      <p>Exp: {cand.experience_years ?? 3} Years</p>
                      <p>Location: {cand.location || cand.city || "Remote"}</p>
                      <p>Notice period: {cand.notice_period || "Immediate"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Core Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {cand.skills ? cand.skills.map((s: any, idx: number) => (
                          <span key={idx} className="bg-surface text-text font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-border">{s}</span>
                        )) : <span>No skills added</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Work History</span>
                      {cand.experience && cand.experience.slice(0, 2).map((exp: any, i: number) => (
                        <div key={i} className="border-l-2 border-primary/20 pl-2 space-y-0.5">
                          <p className="font-black text-text">{exp.designation}</p>
                          <p className="text-[10px] text-muted">{exp.company_name} &bull; {exp.start_date}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Education</span>
                      {cand.education && cand.education.slice(0, 1).map((edu: any, i: number) => (
                        <div key={i} className="border-l-2 border-amber-500/20 pl-2 space-y-0.5">
                          <p className="font-black text-text">{edu.degree} in {edu.field_of_study}</p>
                          <p className="text-[10px] text-muted">{edu.institution} &bull; {edu.end_year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interview Scheduler */}
      {showSchedulerModal && schedulingAppId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowSchedulerModal(false); setSchedulingAppId(null); setInterviewDate(""); }}
              className="absolute top-6 right-6 p-2 text-muted hover:text-text hover:bg-bg rounded-xl min-h-[40px]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-black tracking-tight">Schedule Vetting Interview</h3>
              <p className="text-muted text-sm font-semibold">Book a virtual meeting slot with this developer.</p>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full p-3.5 bg-bg border border-border rounded-2xl font-semibold text-xs min-h-[48px] outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary text-surface font-black text-sm rounded-2xl hover:scale-[1.02] transition-all min-h-[48px] shadow-lg shadow-primary/10 cursor-pointer"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
