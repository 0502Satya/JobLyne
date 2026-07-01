"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  List, 
  Columns3, 
  Search, 
  GripVertical, 
  X 
} from "lucide-react";
import { 
  getApplicantsAction, 
  bulkUpdateApplicantStatusAction, 
  scheduleInterviewAction, 
  compareCandidatesAction 
} from "@/features/company/actions";
import { recordProfileViewAction } from "@/features/auth/actions";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button, Breadcrumbs, Dialog } from "@/shared/ui";

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
  candidate_avatar?: string;
}

interface CompanyApplicantsSectionProps {
  initialJobFilter?: string;
}

export default function CompanyApplicantsSection({ initialJobFilter = "ALL" }: CompanyApplicantsSectionProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [jobFilter, setJobFilter] = useState<string>(initialJobFilter);
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Compare Modal
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[] | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Interview Scheduler Modal
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  // Candidate Profile View Modal
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sessionViewedIds, setSessionViewedIds] = useState<string[]>([]);

  const handleViewProfile = async (candidateId: string, jobId: string) => {
    setProfileLoading(true);
    setShowProfileModal(true);
    try {
      const data = await compareCandidatesAction([candidateId]);
      if (data && !data.error && data.length > 0) {
        setSelectedProfile(data[0]);
        // Trigger record view API once per session for this candidate
        if (!sessionViewedIds.includes(candidateId)) {
          setSessionViewedIds(prev => [...prev, candidateId]);
          await recordProfileViewAction({
            candidateId,
            companyId: "", // Securely resolved by backend
            jobId
          });
        }
      } else {
        toast.error(data?.error || "Profile details not found.");
        setShowProfileModal(false);
      }
    } catch (err) {
      toast.error("Failed to load candidate profile details.");
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

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

  useEffect(() => {
    if (initialJobFilter) {
      setJobFilter(initialJobFilter);
    }
  }, [initialJobFilter]);

  // Bulk Actions
  const handleBulkStatusUpdate = async (newStatus: "INTERVIEW" | "OFFER" | "PLACED" | "REJECTED") => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    const res = await bulkUpdateApplicantStatusAction(selectedIds, newStatus, `Bulk action: ${newStatus}`);
    if (res.error) {
      toast.error(res.error);
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
      toast.error(res.error);
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
      toast.error(data.error);
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
      toast.error(res.error);
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
      <div className="flex justify-center gap-4 items-center min-h-[400px] flex-col">
        <div className="border-t-primary size-12 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="type-label uppercase tracking-widest text-slate-500">Loading Applicants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border/60 bg-surface p-6 rounded-2xl text-center text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Details */}
      <div className="flex justify-between gap-6 flex-col sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-text">Applicants Pipeline</h2>
          <p className="text-muted text-xs mt-1">Vet developer applications, schedule interviews, and select matches.</p>
        </div>
        
        {/* View Toggles */}
        <div className="border-border rounded-2xl p-1 flex bg-surface border">
          <button 
            onClick={() => setViewMode("list")}
            className={`min-h-[40px] type-badge cursor-pointer gap-1.5 uppercase items-center transition-all tracking-wider flex py-2 px-4 rounded-xl ${
              viewMode === "list" ? "bg-primary text-white shadow-md font-bold" : "text-muted hover:text-text"
            }`}
          >
            <List size={16} aria-hidden="true" />
            List view
          </button>
          <button 
            onClick={() => setViewMode("kanban")}
            className={`min-h-[40px] type-badge cursor-pointer gap-1.5 uppercase items-center transition-all tracking-wider flex py-2 px-4 rounded-xl ${
              viewMode === "kanban" ? "bg-primary text-white shadow-md font-bold" : "text-muted hover:text-text"
            }`}
          >
            <Columns3 size={16} aria-hidden="true" />
            Kanban Board
          </button>
        </div>
      </div>

      {/* Filter Operations */}
      <section className="rounded-card border-border gap-4 items-center flex-wrap shadow-sm flex-col p-6 flex bg-surface border md:flex-row">
        
        {/* Sourcing Query */}
        <div className="min-w-[240px] relative flex-1 w-full">
          <label htmlFor="applicant-search-input" className="sr-only">Search applicants</label>
          <Search className="left-4 absolute top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input 
            id="applicant-search-input"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Query name, skills, title..."
            className="w-full outline-none pl-12 min-h-[48px] border-border rounded-2xl py-3.5 bg-bg pr-4 type-caption border focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Job select filter */}
        <div className="w-full md:w-56">
          <label htmlFor="applicant-job-filter-select" className="sr-only">Filter by job</label>
          <select
            id="applicant-job-filter-select"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full outline-none min-h-[48px] border-border rounded-2xl p-3.5 bg-bg cursor-pointer type-caption border text-text"
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
            <label htmlFor="applicant-status-filter-select" className="sr-only">Filter by status</label>
            <select
              id="applicant-status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full outline-none min-h-[48px] border-border rounded-2xl p-3.5 bg-bg cursor-pointer type-caption border text-text"
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
        <div className="bg-gradient-primary gap-4 rounded-3xl items-center flex-wrap animate-in slide-in-from-bottom-6 duration-300 flex p-4 text-white justify-between">
          <span className="pl-2 uppercase tracking-wider type-badge">{selectedIds.length} Applicants Selected</span>
          <div className="flex gap-2.5">
            <Button 
              onClick={handleCompareTrigger}
              variant="secondary"
              size="sm"
            >
              Compare Side-by-Side
            </Button>
            <Button 
              onClick={() => handleBulkStatusUpdate("INTERVIEW")}
              variant="primary"
              size="sm"
            >
              Shortlist (Interview)
            </Button>
            <Button 
              onClick={() => handleBulkStatusUpdate("REJECTED")}
              variant="danger"
              size="sm"
            >
              Bulk Reject
            </Button>
          </div>
        </div>
      )}

      {/* Dynamic Display Panel */}
      {viewMode === "list" ? (
        /* List View Representation */
        <div className="rounded-card border-border overflow-hidden shadow-sm bg-surface border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px] text-left">
              <thead>
                <tr className="border-b bg-bg/50 border-border">
                  <th className="text-center p-4 w-12">
                    <input 
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredApps.length}
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer"
                    />
                  </th>
                  <th className="type-badge p-4">Candidate</th>
                  <th className="type-badge p-4">Job Position</th>
                  <th className="type-badge p-4">Vetting skills</th>
                  <th className="type-badge p-4">Experience</th>
                  <th className="type-badge p-4">Status</th>
                  <th className="text-right type-badge p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id} className="border-b transition-colors border-border last:border-0 hover:bg-bg/10">
                    <td className="text-center p-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="size-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {app.candidate_avatar ? (
                          <Image 
                            src={app.candidate_avatar} 
                            alt={app.candidate_name} 
                            width={40}
                            height={40}
                            unoptimized
                            className="size-10 rounded-full object-cover border border-border/60 shrink-0" 
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {app.candidate_name?.substring(0, 2).toUpperCase() || "CN"}
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-text type-ui leading-tight font-bold">{app.candidate_name}</h4>
                          <p className="text-xs leading-normal truncate max-w-xs text-muted">{app.candidate_headline || "Software Engineer"}</p>
                          <div className="text-muted text-xs gap-2 flex">
                            <a href={`mailto:${app.candidate_email}`} className="hover:underline">{app.candidate_email}</a>
                            <span>&bull;</span>
                            <span>{app.candidate_phone || "Not provided"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="type-ui p-4">{app.job_title}</td>
                    <td className="p-4">
                      <div className="gap-1 flex max-w-xs flex-wrap">
                        {app.candidate_skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-text px-2 border-border uppercase text-xs bg-bg rounded-full py-0.5 border">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="type-ui p-4">{app.candidate_experience ?? 3} Years</td>
                    <td className="p-4">
                      <span className={`py-1 px-2.5 rounded-full type-badge ${
                        app.status === "PENDING" ? "text-info bg-info-bg" :
                        app.status === "INTERVIEW" ? "bg-warning-bg text-warning" :
                        app.status === "OFFER" ? "text-featured bg-featured-bg" :
                        app.status === "PLACED" ? "bg-success-bg text-success" : "text-error bg-error-bg"
                      }`}>{app.status}</span>
                      {app.interview_schedule && app.status === "INTERVIEW" && (
                        <div className="mt-1 text-warning text-xs">
                          Slot: {new Date(app.interview_schedule).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap space-x-1.5 text-right">
                      <Button
                        onClick={() => handleViewProfile(app.candidate_id, app.job)}
                        variant="secondary"
                        size="sm"
                        className="text-xs uppercase min-h-0 py-2"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => {
                          setSchedulingAppId(app.id);
                          setShowSchedulerModal(true);
                        }}
                        variant="primary"
                        size="sm"
                        className="text-xs uppercase min-h-0 py-2"
                      >
                        Schedule
                      </Button>
                      <Button
                        disabled={!app.candidate_user_id}
                        title={!app.candidate_user_id ? "This candidate does not have a user profile established yet." : "Chat with candidate"}
                        onClick={async () => {
                          if (!app.candidate_user_id) return;
                          const { startThreadAction } = await import("@/features/auth/actions");
                          const res = await startThreadAction(app.candidate_user_id);
                          if (res.thread_id) {
                            router.push(`/company/messages?thread=${res.thread_id}`);
                          } else {
                            toast.error("Cannot start direct chat. No user account linked.");
                          }
                        }}
                        variant="secondary"
                        size="sm"
                        className="text-xs uppercase min-h-0 py-2"
                      >
                        Chat
                      </Button>
                      {app.candidate_resume && (
                        <a
                          href={app.candidate_resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="justify-center rounded-xl border-border inline-flex text-xs px-3 uppercase items-center h-9 transition-all text-muted py-2 bg-surface border hover:text-text"
                        >
                          Resume
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="type-label p-12 text-center">
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
        <div className="items-start gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {(["PENDING", "INTERVIEW", "OFFER", "PLACED"] as const).map(stage => {
            const stageApps = filteredApps.filter(a => a.status === stage);
            return (
              <div key={stage} className="rounded-card border-border p-5 space-y-4 bg-surface border">
                <div className="border-b items-center border-border/60 flex pb-2 justify-between">
                  <h4 className="text-text type-badge font-bold">
                    {stage === "PENDING" ? "Sourced" : stage === "INTERVIEW" ? "Interviewing" : stage === "OFFER" ? "Offered" : "Placed"}
                  </h4>
                  <span className="bg-bg px-2.5 rounded-full py-0.5 type-badge text-muted font-bold">{stageApps.length}</span>
                </div>
                <div className="space-y-3 min-h-[248px]">
                  {stageApps.map(app => (
                    <div key={app.id} className="group rounded-2xl relative border-border/80 bg-bg transition-all shadow-sm space-y-3 p-4 border hover:border-primary/40">
                      <div className="flex items-center gap-3">
                        {app.candidate_avatar ? (
                          <Image 
                            src={app.candidate_avatar} 
                            alt={app.candidate_name} 
                            width={32}
                            height={32}
                            unoptimized
                            className="size-8 rounded-full object-cover border border-border/60 shrink-0" 
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {app.candidate_name?.substring(0, 2).toUpperCase() || "CN"}
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <h5 className="text-text type-ui leading-tight font-bold">{app.candidate_name}</h5>
                          <p className="text-xs truncate text-muted leading-none">{app.candidate_headline || "Candidate"}</p>
                        </div>
                      </div>
                      <p className="text-muted type-badge font-medium">{app.job_title.split(" ")[0]}</p>
                      {app.candidate_skills.length > 0 && (
                        <div className="gap-1 flex flex-wrap">
                          {app.candidate_skills.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="text-xs px-1.5 border-border uppercase rounded-full py-0.5 bg-surface text-muted border">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-border/50 items-center pt-2 flex justify-between">
                        <button
                          onClick={() => handleViewProfile(app.candidate_id, app.job)}
                          className="text-primary text-xs hover:underline cursor-pointer font-bold"
                        >
                          View Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            setSchedulingAppId(app.id);
                            setShowSchedulerModal(true);
                          }}
                          className="text-muted hover:text-text text-xs cursor-pointer font-bold"
                        >
                          Schedule
                        </button>
                        
                        {/* Transition Select Menu */}
                        <select
                          value={app.status}
                          onChange={(e) => transitionStage(app.id, e.target.value)}
                          className="px-2 py-1 outline-none border-border uppercase text-xs rounded-lg text-muted cursor-pointer bg-surface border hover:text-text font-bold"
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
                    <div className="type-caption justify-center border-dashed rounded-2xl min-h-[152px] items-center border-border/60 text-center flex-col flex p-8 text-muted border">
                      <GripVertical className="mb-2 text-border" size={24} aria-hidden="true" />
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Candidate Comparison Side-by-Side */}
      <Dialog
        isOpen={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setCompareData(null);
        }}
        title="Candidate Comparison Matrix"
        size="lg"
      >
        {compareData && (
          <div>
            <p className="type-label mb-6 text-sm">Side-by-side comparative analysis of selected shortlisted developers.</p>
            <div className="items-start gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {compareData.map((cand) => (
                <div key={cand.id} className="border-border rounded-3xl bg-bg shadow-sm p-6 space-y-5 border">
                  <div className="border-b space-y-2 border-border/80 text-center pb-4">
                    <div className="justify-center mx-auto type-h2 shadow-md bg-gradient-primary items-center text-white rounded-full flex size-16">
                      {cand.full_name?.substring(0, 2).toUpperCase() || "CN"}
                    </div>
                    <div>
                      <h4 className="text-text type-card-title leading-tight font-bold">{cand.full_name || "Candidate"}</h4>
                      <p className="type-caption text-muted mt-0.5">{cand.headline || "Developer"}</p>
                    </div>
                  </div>

                  <div className="text-text type-caption space-y-4">
                    <div className="space-y-1">
                      <span className="block type-badge text-muted font-bold">Sourcing details</span>
                      <p>Exp: {cand.experience_years ?? 3} Years</p>
                      <p>Location: {cand.location || cand.city || "Remote"}</p>
                      <p>Notice period: {cand.notice_period || "Immediate"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block type-badge text-muted font-bold">Core Skills</span>
                      <div className="gap-1 flex flex-wrap">
                        {cand.skills ? cand.skills.map((s: any, idx: number) => (
                          <span key={idx} className="text-text px-2 border-border uppercase text-xs rounded-full py-0.5 bg-surface border">{s}</span>
                        )) : <span>No skills added</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block type-badge text-muted font-bold">Work History</span>
                      {cand.experience && cand.experience.slice(0, 2).map((exp: any, i: number) => (
                        <div key={i} className="border-l-2 pl-2 border-primary/20 space-y-0.5">
                          <p className="text-text font-semibold">{exp.designation}</p>
                          <p className="text-xs text-muted">{exp.company_name} &bull; {exp.start_date}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <span className="block type-badge text-muted font-bold">Education</span>
                      {cand.education && cand.education.slice(0, 1).map((edu: any, i: number) => (
                        <div key={i} className="space-y-0.5 border-l-2 pl-2 border-warning/20">
                          <p className="text-text font-semibold">{edu.degree} in {edu.field_of_study}</p>
                          <p className="text-xs text-muted">{edu.institution} &bull; {edu.end_year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Dialog>

      {/* MODAL 2: Interview Scheduler */}
      <Dialog
        isOpen={showSchedulerModal}
        onClose={() => {
          setShowSchedulerModal(false);
          setSchedulingAppId(null);
          setInterviewDate("");
        }}
        title="Schedule Vetting Interview"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSchedulerModal(false);
                setSchedulingAppId(null);
                setInterviewDate("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="schedule-interview-form"
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        }
      >
        <p className="type-label mb-4 text-sm">Book a virtual meeting slot with this developer.</p>

        <form id="schedule-interview-form" onSubmit={handleScheduleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="type-badge block font-bold text-slate-400">Date and time</label>
            <input 
              type="datetime-local" 
              required
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="w-full outline-none min-h-[48px] border-border rounded-2xl p-3.5 bg-bg type-caption border focus:ring-2 focus:ring-primary text-text font-semibold"
            />
          </div>
        </form>
      </Dialog>

      {/* MODAL 3: Candidate Full Profile View */}
      <Dialog
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfile(null);
        }}
        title="Candidate Profile Details"
        size="lg"
      >
        {profileLoading ? (
          <div className="py-20 text-center text-muted">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-xs">Loading candidate profile data securely...</p>
          </div>
        ) : selectedProfile ? (
          <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-2">
            
            {/* Header section */}
            <div className="flex gap-4 items-center border-b border-border/60 pb-5">
              {selectedProfile.user?.profile_photo_url ? (
                <Image 
                  src={selectedProfile.user.profile_photo_url} 
                  alt={selectedProfile.full_name} 
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-full object-cover border border-border" 
                />
              ) : (
                <div className="size-16 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-lg uppercase">
                  {selectedProfile.full_name?.substring(0, 2).toUpperCase() || "CN"}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold text-text leading-tight">{selectedProfile.full_name}</h3>
                <p className="text-sm text-muted mt-1 font-medium">{selectedProfile.headline || "Software Engineer"}</p>
                <p className="text-xs text-muted mt-0.5">{selectedProfile.location || selectedProfile.city || "Remote"}</p>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal info & contact */}
              <div className="space-y-5 lg:col-span-1 border-r border-border/40 pr-0 lg:pr-6">
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Personal & Contact</h4>
                  <div className="space-y-2.5 text-xs text-text">
                    <div><span className="text-muted block">Email Address</span> <span className="font-semibold">{selectedProfile.user?.email}</span></div>
                    <div><span className="text-muted block">Phone Contact</span> <span className="font-semibold">{selectedProfile.phone || "Not provided"}</span></div>
                    {selectedProfile.whatsapp_number && (
                      <div><span className="text-muted block">WhatsApp</span> <span className="font-semibold">{selectedProfile.whatsapp_number}</span></div>
                    )}
                    <div><span className="text-muted block">Experience</span> <span className="font-semibold">{selectedProfile.experience_years ?? 3} Years</span></div>
                    <div><span className="text-muted block">Current / Expected Salary</span> <span className="font-semibold">{selectedProfile.current_salary || "N/A"} / {selectedProfile.expected_salary || "N/A"} {selectedProfile.currency || ""}</span></div>
                    {selectedProfile.notice_period && (
                      <div><span className="text-muted block">Notice Period</span> <span className="font-semibold">{selectedProfile.notice_period}</span></div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Links & Portfolios</h4>
                  <div className="space-y-2 text-xs">
                    {selectedProfile.social_links && Object.entries(selectedProfile.social_links).map(([platform, url]: any) => (
                      <div key={platform}>
                        <span className="text-muted uppercase text-[10px] font-bold block">{platform}</span>
                        <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold truncate block">{url}</a>
                      </div>
                    ))}
                    {(!selectedProfile.social_links || Object.keys(selectedProfile.social_links).length === 0) && (
                      <span className="text-xs text-muted font-medium">No social media links connected.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Curriculum Vitae</h4>
                  {selectedProfile.resume_file_url ? (
                    <a
                      href={selectedProfile.resume_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-10 border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      View Resume PDF
                    </a>
                  ) : (
                    <span className="text-xs text-muted font-medium block">No resume document uploaded.</span>
                  )}
                </div>
              </div>

              {/* Right Column: Experience, Education, Projects, Skills */}
              <div className="space-y-6 lg:col-span-2">
                
                {/* Work Experience */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Work Experience</h4>
                  <div className="space-y-4">
                    {selectedProfile.candidate_experience_job_seeker && selectedProfile.candidate_experience_job_seeker.map((exp: any) => (
                      <div key={exp.id} className="border-l-2 border-primary/30 pl-3.5 space-y-1">
                        <h5 className="text-sm font-bold text-text">{exp.designation}</h5>
                        <p className="text-xs font-semibold text-muted">{exp.company_name} &bull; {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}</p>
                        {exp.responsibilities && (
                          <p className="text-xs text-muted leading-relaxed whitespace-pre-line mt-1">{exp.responsibilities}</p>
                        )}
                      </div>
                    ))}
                    {(!selectedProfile.candidate_experience_job_seeker || selectedProfile.candidate_experience_job_seeker.length === 0) && (
                      <span className="text-xs text-muted font-medium">No work experiences added.</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Education</h4>
                  <div className="space-y-4">
                    {selectedProfile.candidate_education_job_seeker && selectedProfile.candidate_education_job_seeker.map((edu: any) => (
                      <div key={edu.id} className="border-l-2 border-warning/30 pl-3.5 space-y-1">
                        <h5 className="text-sm font-bold text-text">{edu.degree} in {edu.field_of_study}</h5>
                        <p className="text-xs font-semibold text-muted">{edu.institution} &bull; {edu.start_year} - {edu.end_year}</p>
                      </div>
                    ))}
                    {(!selectedProfile.candidate_education_job_seeker || selectedProfile.candidate_education_job_seeker.length === 0) && (
                      <span className="text-xs text-muted font-medium">No education records added.</span>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Projects</h4>
                  <div className="space-y-4">
                    {selectedProfile.candidate_projects_job_seeker && selectedProfile.candidate_projects_job_seeker.map((proj: any) => (
                      <div key={proj.id} className="border-l-2 border-indigo-400/30 pl-3.5 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-sm font-bold text-text">{proj.title}</h5>
                          {proj.project_url && (
                            <a href={proj.project_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">Link</a>
                          )}
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                    {(!selectedProfile.candidate_projects_job_seeker || selectedProfile.candidate_projects_job_seeker.length === 0) && (
                      <span className="text-xs text-muted font-medium">No projects added.</span>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted">Skills Inventory</h4>
                  <div className="gap-2 flex flex-wrap">
                    {selectedProfile.job_seeker_skills_job_seeker && selectedProfile.job_seeker_skills_job_seeker.map((s: any) => (
                      <span key={s.id} className="text-text px-2.5 border-border uppercase text-xs rounded-xl py-1 bg-surface border font-bold">
                        {s.skill?.name} {s.years_of_experience ? `(${s.years_of_experience} yrs)` : ""}
                      </span>
                    ))}
                    {(!selectedProfile.job_seeker_skills_job_seeker || selectedProfile.job_seeker_skills_job_seeker.length === 0) && (
                      <span className="text-xs text-muted font-medium">No skills listed.</span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : null}
      </Dialog>

    </div>
  );
}
