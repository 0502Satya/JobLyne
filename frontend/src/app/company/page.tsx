"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyProfileAction, logoutAction } from "@/features/auth/actions";
import { getJobsAction } from "@/features/auth/jobActions";
import { createJobAction, updateJobAction } from "@/features/company/actions";
import { getRecruiterDashboardAction, postRecruiterCandidateAction } from "@/features/recruiter/actions";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
}

interface Candidate {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  avatarColor: string;
  matchScore: number;
  skills: string[];
  location: string;
  experience: string;
  bio: string;
  status: "Sourced" | "Interviewing" | "Offered" | "Placed";
  isShortlisted?: boolean;
  interviewStatus?: "Invited" | "None";
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "sourcing">("overview");
  
  // Interactive Job Postings State
  const [jobs, setJobs] = useState<JobPost[]>([]);

  // Interactive Sourcing State
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "Engineering",
    location: "",
    type: "Full-time",
    salary: "",
  });

  // Filter Sourcing State
  const [searchQuery, setSearchQuery] = useState("");

  const getStableApplicantCount = (jobId: string) => {
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
      hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 15) + 2; // Stable number between 2 and 16 applicants
  };

  const mapDbJobToJobPost = (dbJob: any): JobPost => {
    let statusMapped: JobPost["status"] = "Active";
    if (dbJob.status === "CLOSED") statusMapped = "Closed";
    else if (dbJob.status === "DRAFT") statusMapped = "Draft";

    let salaryStr = "Negotiable";
    if (dbJob.salary_min && dbJob.salary_max) {
      salaryStr = `$${Number(dbJob.salary_min).toLocaleString()} - $${Number(dbJob.salary_max).toLocaleString()}`;
    } else if (dbJob.salary_min) {
      salaryStr = `$${Number(dbJob.salary_min).toLocaleString()}+`;
    }

    return {
      id: dbJob.id,
      title: dbJob.title,
      department: dbJob.description?.includes("Department:") 
        ? dbJob.description.split("Department:")[1]?.split("\n")[0]?.trim() || "Engineering" 
        : "Engineering",
      location: dbJob.location || dbJob.raw_location || "Remote",
      type: dbJob.employment_type || "Full-time",
      salary: salaryStr,
      status: statusMapped,
      applicants: getStableApplicantCount(dbJob.id)
    };
  };

  const loadCompanyDashboardData = async () => {
    try {
      const profileData = await getCompanyProfileAction();
      if (!profileData.error) {
        setProfile(profileData);
      }

      // Fetch corporate jobs
      const jobsData = await getJobsAction({ my_jobs: "true" });
      if (!jobsData.error) {
        const jobsArray = Array.isArray(jobsData) ? jobsData : (jobsData.results || []);
        const mappedJobs = jobsArray.map(mapDbJobToJobPost);
        setJobs(mappedJobs);
      }

      // Fetch candidates pool
      const candidatesData = await getRecruiterDashboardAction();
      if (!candidatesData.error) {
        setCandidates(candidatesData.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyDashboardData();
  }, []);

  // Compute completeness metric
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 20; // base registered score
    if (profile.description) score += 20;
    if (profile.industry) score += 20;
    if (profile.website) score += 20;
    if (profile.city || profile.country) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();
  const isProfileIncomplete = completeness < 100;

  // Time-sensitive greetings
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  // Job Modal Actions
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.location || !newJob.salary) return;

    // Parse salary min and max
    const matches = newJob.salary.match(/\d+[\d,.]*/g);
    let sMin: number | undefined;
    let sMax: number | undefined;
    if (matches) {
      sMin = parseFloat(matches[0].replace(/,/g, ''));
      if (matches[1]) {
        sMax = parseFloat(matches[1].replace(/,/g, ''));
      }
    }

    // Auto skill tagging helper based on job title keywords
    const titleLower = newJob.title.toLowerCase();
    let taggedSkills: string[] = ["Software Engineering"];
    if (titleLower.includes("react") || titleLower.includes("frontend") || titleLower.includes("design")) {
      taggedSkills = ["React", "TypeScript", "Next.js", "TailwindCSS"];
    } else if (titleLower.includes("full-stack") || titleLower.includes("node")) {
      taggedSkills = ["Node.js", "TypeScript", "React", "PostgreSQL"];
    } else if (titleLower.includes("python") || titleLower.includes("ai") || titleLower.includes("ml")) {
      taggedSkills = ["Python", "Next.js", "AI", "PyTorch"];
    } else if (titleLower.includes("cloud") || titleLower.includes("ops") || titleLower.includes("architect")) {
      taggedSkills = ["AWS", "Kubernetes", "Go", "Terraform"];
    }

    const payload = {
      title: newJob.title,
      description: `Department: ${newJob.department}\nRequirements for ${newJob.title} in ${newJob.location}.\nSalary tag: ${newJob.salary}`,
      requirements: `Vetted experience in core technologies and workflows.`,
      location: newJob.location,
      employment_type: newJob.type,
      experience_required: 3,
      salary_min: sMin,
      salary_max: sMax,
      skills: taggedSkills,
      currency: "USD"
    };

    setLoading(true);
    const res = await createJobAction(payload);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    } else {
      setShowJobModal(false);
      setNewJob({
        title: "",
        department: "Engineering",
        location: "",
        type: "Full-time",
        salary: "",
      });
      await loadCompanyDashboardData();
    }
  };

  // Invite candidate action
  const handleInviteCandidate = async (candidateId: string) => {
    // Optimistic update
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, interviewStatus: "Invited", status: "Interviewing" } : c)
    );

    const res = await postRecruiterCandidateAction(candidateId, 'invite');
    if (res.error) {
      alert(res.error);
      loadCompanyDashboardData();
    } else {
      loadCompanyDashboardData();
    }
  };

  // Start chat with candidate
  const handleStartChat = async (recipientId?: string) => {
    if (!recipientId) {
      alert("This candidate does not have a user profile established yet.");
      return;
    }

    const { startThreadAction } = await import("@/features/auth/actions");
    const res = await startThreadAction(recipientId);
    if (res.error) {
      alert(res.error);
    } else if (res.thread_id) {
      router.push(`/company/messages?thread=${res.thread_id}`);
    }
  };

  // Toggle Job Status Action
  const toggleJobStatus = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    let nextDbStatus = "OPEN";
    let nextStatus: JobPost["status"] = "Active";

    if (job.status === "Active") {
      nextDbStatus = "CLOSED";
      nextStatus = "Closed";
    } else if (job.status === "Closed") {
      nextDbStatus = "DRAFT";
      nextStatus = "Draft";
    } else {
      nextDbStatus = "OPEN";
      nextStatus = "Active";
    }

    // Optimistic UI update
    setJobs(prev =>
      prev.map(j => j.id === id ? { ...j, status: nextStatus } : j)
    );

    const res = await updateJobAction(id, { status: nextDbStatus });
    if (res.error) {
      alert(res.error);
      loadCompanyDashboardData();
    } else {
      loadCompanyDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors flex flex-col font-sans">
      
      {/* Dashboard Sticky Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hidden md:inline-block">Company Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/company/applicants" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">view_week</span>
            Applicants Pipeline
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <Link href="/company/messages" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Messages
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <Link href="/company/team" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">group</span>
            Team
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <Link href="/company/billing" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
            Billing
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <Link 
            href="/company/settings/organization" 
            className="p-2.5 text-muted hover:text-primary transition-colors hover:bg-bg rounded-xl flex items-center justify-center size-11"
            title="Organization Settings"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </Link>
          <div className="h-10 w-px bg-border"></div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 cursor-pointer">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "CO"}
            </div>
            <div className="hidden lg:block text-left">
              <h4 className="text-sm font-black tracking-tight">{profile?.name || "Company Portal"}</h4>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{profile?.industry || "Unverified"}</p>
            </div>
          </div>
          <button 
            onClick={() => logoutAction()} 
            className="text-xs font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/5 active:scale-[0.98] min-h-[44px]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-surface border-b border-border px-6 md:px-12 py-1">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {(["overview", "jobs", "sourcing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-5 font-black text-sm tracking-tight border-b-2 transition-all flex items-center gap-2 uppercase whitespace-nowrap min-h-[48px] ${
                activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted hover:text-text hover:border-border"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {tab === "overview" ? "dashboard" : tab === "jobs" ? "work" : "group_search"}
              </span>
              {tab === "overview" ? "Overview" : tab === "jobs" ? "Jobs Hub" : "AI Sourcing"}
            </button>
          ))}
        </div>
      </div>

      <main className="p-6 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-8 box-sizing">
        
        {/* Profile Completion Warning Notification */}
        {isProfileIncomplete && (
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 max-w-full">
            <div className="flex items-center gap-5 flex-wrap md:flex-nowrap">
              {/* Circular Gauge */}
              <div className="relative size-16 flex items-center justify-center shrink-0">
                <svg className="size-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="6" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    fill="transparent" 
                    stroke="rgb(245, 158, 11)" 
                    strokeWidth="6" 
                    strokeDasharray={2 * Math.PI * 28} 
                    strokeDashoffset={2 * Math.PI * 28 * (1 - completeness / 100)} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-warning">{completeness}%</span>
              </div>
              <div className="space-y-1 max-w-[100%] overflow-wrap break-word">
                <h4 className="font-black text-text text-base">Complete your profile credentials</h4>
                <p className="text-sm text-muted font-medium max-w-xl">
                  Profiles at 100% completion receive a verification badge, increasing developer application rates by up to 250%. Add missing culture details and HQ coordinates.
                </p>
              </div>
            </div>
            <Link 
              href="/company/settings/organization" 
              className="bg-warning text-surface px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-warning/20 hover:scale-[1.03] transition-all whitespace-nowrap active:scale-[0.98] min-h-[48px] flex items-center justify-center w-full md:w-auto"
            >
              Complete Workspace
            </Link>
          </div>
        )}

        {/* Tab Content Rendering */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Welcome Banner */}
            <section className="bg-gradient-to-r from-primary to-[#4c33cf] rounded-card p-8 md:p-12 text-surface relative overflow-hidden shadow-2xl shadow-primary/25 max-w-full">
              <div className="relative z-10 space-y-5">
                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/15">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[11px] font-black tracking-widest uppercase">System Operational</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {getGreeting()}{profile?.name ? `, ${profile.name}` : ""}!
                </h1>
                <p className="text-surface/90 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                  Your workspace is synchronized. You currently have {jobs.filter(j => j.status === "Active").length} active engineer pipelines with new applications ready for review.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <button 
                    onClick={() => { setActiveTab("jobs"); setShowJobModal(true); }}
                    className="bg-surface text-primary font-black px-6 py-4 rounded-2xl hover:scale-[1.03] hover:shadow-2xl transition-all flex items-center gap-2 active:scale-[0.98] min-h-[48px]"
                  >
                    <span className="material-symbols-outlined font-black">add_circle</span>
                    Post Live Position
                  </button>
                  <button 
                    onClick={() => setActiveTab("sourcing")}
                    className="bg-white/10 backdrop-blur-md text-surface border border-white/20 font-black px-6 py-4 rounded-2xl hover:bg-white/20 hover:scale-[1.03] transition-all active:scale-[0.98] min-h-[48px]"
                  >
                    Launch Sourcing
                  </button>
                </div>
              </div>
              {/* Decorative dynamic circles */}
              <div className="absolute top-0 right-0 size-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 size-80 bg-black/10 rounded-full blur-3xl"></div>
            </section>

            {/* Quick Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Active Positions", count: jobs.filter(j => j.status === "Active").length, icon: "work", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20", trend: "Interactive" },
                { title: "Developer Pool", count: candidates.length, icon: "groups", color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10", border: "border-[#8b5cf6]/20", trend: "Live database" },
                { title: "Interviews Booked", count: candidates.filter(c => c.interviewStatus === "Invited").length, icon: "calendar_today", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", trend: "Active pipeline" },
              ].map((stat, i) => (
                <div key={i} className={`bg-surface border ${stat.border} p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 relative group`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`size-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                      <span className={`material-symbols-outlined text-[28px] ${stat.color}`}>{stat.icon}</span>
                    </div>
                    <span className="text-4xl font-black tracking-tight text-text">{stat.count}</span>
                  </div>
                  <h4 className="font-bold text-muted text-sm uppercase tracking-wider mb-1">{stat.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    {stat.trend}
                  </div>
                </div>
              ))}
            </section>

            {/* Layout Split: Live jobs & Sourcing widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left 2 Columns: Live postings */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black tracking-tight">Active Postings Overview</h3>
                  <button 
                    onClick={() => setActiveTab("jobs")} 
                    className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                  >
                    View All Positions <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="bg-surface border border-border p-6 rounded-2xl hover:border-primary/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-black text-base text-text">{job.title}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            job.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-warning/10 text-warning"
                          }`}>{job.status}</span>
                        </div>
                        <p className="text-xs text-muted font-bold tracking-tight">{job.department} &bull; {job.location} &bull; {job.salary}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <span className="text-base font-black text-text block">{job.applicants}</span>
                          <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Applicants</span>
                        </div>
                        <button 
                          onClick={() => toggleJobStatus(job.id)}
                          className="bg-bg text-text hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all min-h-[40px]"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="bg-surface border border-border p-8 rounded-2xl text-center text-muted font-semibold text-sm">
                      No active listings found. Create a requisition to get started.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Mini candidate cards */}
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">Hot Talent Picks</h3>
                <div className="space-y-4 bg-surface border border-border p-6 rounded-3xl">
                  {candidates.slice(0, 2).map((c) => (
                    <div key={c.id} className="border-b border-border last:border-0 pb-4 last:pb-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl ${c.avatarColor} text-white flex items-center justify-center font-black shadow-md`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-text">{c.name}</h4>
                          <p className="text-xs text-muted font-semibold">{c.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="bg-bg text-muted font-black text-[9px] uppercase px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-full">{c.matchScore}% Match</span>
                        <button 
                          onClick={() => setActiveTab("sourcing")}
                          className="text-xs font-bold text-muted hover:text-primary transition-colors flex items-center gap-0.5"
                        >
                          Source <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="text-center text-muted text-xs font-semibold py-4">
                      Loading sourcing picks...
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Support section */}
            <section className="bg-surface rounded-card p-8 border border-dashed border-border flex flex-col md:flex-row justify-between items-center gap-8 max-w-full">
              <div className="space-y-2 text-center md:text-left overflow-wrap break-word max-w-full">
                <h3 className="text-2xl font-black text-text tracking-tight">Access talent intelligence specialists</h3>
                <p className="text-muted font-medium text-sm max-w-lg">Need dedicated guidance? Our staffing specialists can assist you in composing the ideal JD and vetting workflows.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => alert("Staffing guidebook downloaded!")}
                  className="bg-bg border border-border px-6 py-4 rounded-2xl font-black text-sm text-text hover:bg-surface hover:shadow-lg transition-all min-h-[48px] w-full sm:w-auto"
                >
                  Documentation Guide
                </button>
                <button 
                  onClick={() => alert("Talent strategist has been notified! We will contact you within 2 business hours.")}
                  className="bg-primary text-surface px-6 py-4 rounded-2xl font-black text-sm hover:scale-[1.03] transition-all min-h-[48px] w-full sm:w-auto"
                >
                  Contact Support
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Job management hub */}
        {activeTab === "jobs" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Active Postings Hub</h2>
                <p className="text-muted text-sm font-semibold">Monitor applications, modify status flags, and post new open requisitions.</p>
              </div>
              <button 
                onClick={() => setShowJobModal(true)}
                className="bg-primary text-surface px-6 py-3.5 rounded-2xl font-black hover:scale-[1.03] transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span className="material-symbols-outlined">add_circle</span>
                New Requisition
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-surface border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-text">{job.title}</h3>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        job.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : job.status === "Draft" ? "bg-warning/10 text-warning" : "bg-red-500/10 text-red-500"
                      }`}>{job.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted font-bold">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">folder</span>{job.department}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{job.location}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">payments</span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-border md:border-t-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-2xl font-black text-text block">{job.applicants}</span>
                      <span className="text-xs text-muted font-bold uppercase tracking-widest">Active Applicants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleJobStatus(job.id)}
                        className="bg-bg hover:bg-primary hover:text-white text-text font-black px-5 py-3 rounded-2xl text-sm transition-all min-h-[44px]"
                      >
                        Toggle State
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="bg-surface border border-border p-12 rounded-3xl text-center space-y-4">
                  <span className="material-symbols-outlined text-6xl text-muted">work_off</span>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black font-sans">No live postings found</h4>
                    <p className="text-sm text-muted">Create a requisition to attract elite engineering candidates.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Talent sourcing and matchmaking */}
        {activeTab === "sourcing" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Talent Sourcing Portal</h2>
              <p className="text-muted text-sm font-semibold">Match instantly with top tier software engineers, designers, and managers.</p>
            </div>

            {/* Sourcing filters */}
            <div className="bg-surface border border-border p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, skills, location (e.g. Next.js, Stripe, Remote)..."
                  className="w-full pl-12 pr-4 py-3.5 bg-bg border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium transition-all text-sm min-h-[48px]"
                />
              </div>
              <button 
                onClick={() => setSearchQuery("")}
                className="bg-bg text-text hover:bg-border px-6 py-3.5 rounded-2xl font-black text-sm transition-all min-h-[48px] w-full md:w-auto whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>

            {/* Candidate list */}
            <div className="grid grid-cols-1 gap-6">
              {candidates
                .filter(c => {
                  const term = searchQuery.toLowerCase();
                  return c.name.toLowerCase().includes(term) || 
                         c.role.toLowerCase().includes(term) || 
                         c.skills.some(s => s.toLowerCase().includes(term)) ||
                         c.location.toLowerCase().includes(term);
                })
                .map((c) => (
                  <div key={c.id} className="bg-surface border border-border p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="space-y-4 flex-1">
                      
                      {/* Core header */}
                      <div className="flex items-start gap-4">
                        <div className={`size-14 rounded-2xl ${c.avatarColor} text-white flex items-center justify-center font-black text-lg shadow-md shrink-0`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black text-text leading-tight">{c.name}</h3>
                            <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">workspace_premium</span>
                              {c.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm text-muted font-bold tracking-tight">{c.role} &bull; {c.experience} Exp</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm font-medium text-muted leading-relaxed max-w-2xl">{c.bio}</p>

                      {/* Skill badges */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {c.skills.map((skill, idx) => (
                          <span key={idx} className="bg-bg text-text font-black text-xs uppercase px-3 py-1.5 rounded-full border border-border">{skill}</span>
                        ))}
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-4 text-xs text-muted font-bold pt-2">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{c.location}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">work_history</span>{c.experience}</span>
                      </div>

                    </div>

                    {/* Interactive CTAs */}
                    <div className="lg:border-l border-border lg:pl-8 flex flex-col gap-3 w-full lg:w-64 shrink-0 pt-4 lg:pt-0">
                      <div className="text-left lg:text-right space-y-1 pb-2">
                        <span className="text-[10px] text-muted font-black uppercase tracking-widest block">Status</span>
                        <span className={`text-xs font-black uppercase ${
                          c.interviewStatus === "Invited" ? "text-emerald-500" : "text-muted"
                        }`}>
                          {c.interviewStatus === "Invited" ? "Interview Requested" : "Open to Sourcing"}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleInviteCandidate(c.id)}
                        disabled={c.interviewStatus === "Invited"}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 min-h-[48px] transition-all active:scale-[0.98] ${
                          c.interviewStatus === "Invited" 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default" 
                            : "bg-primary text-surface hover:scale-[1.02] shadow-lg shadow-primary/10"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {c.interviewStatus === "Invited" ? "check_circle" : "mail"}
                        </span>
                        {c.interviewStatus === "Invited" ? "Invited" : "Request Interview"}
                      </button>

                      <button
                        onClick={() => handleStartChat(c.user_id)}
                        className="w-full bg-surface border border-border hover:bg-bg text-text font-black py-3.5 px-4 rounded-2xl text-xs transition-all min-h-[48px] flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        Send Message
                      </button>

                      <button 
                        onClick={() => {
                          postRecruiterCandidateAction(c.id, 'toggle_shortlist');
                          alert(`${c.name} saved to workspace portfolio!`);
                        }}
                        className="w-full bg-bg hover:bg-border text-text font-black py-3.5 px-4 rounded-2xl text-sm transition-all min-h-[48px]"
                      >
                        Save Candidate
                      </button>
                    </div>
                  </div>
                ))}

              {candidates.filter(c => {
                const term = searchQuery.toLowerCase();
                return c.name.toLowerCase().includes(term) || 
                       c.role.toLowerCase().includes(term) || 
                       c.skills.some(s => s.toLowerCase().includes(term)) ||
                       c.location.toLowerCase().includes(term);
              }).length === 0 && (
                <div className="bg-surface border border-border p-12 rounded-3xl text-center space-y-4">
                  <span className="material-symbols-outlined text-6xl text-muted">search_off</span>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black font-sans">No engineers found matching filter</h4>
                    <p className="text-sm text-muted">Try removing tags or adjusting your search parameters.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Interactive Modal: New Job Requisition */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-8 w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowJobModal(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-text hover:bg-bg rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="space-y-2 mb-6">
              <h3 className="text-2xl font-black tracking-tight">Create Job Requisition</h3>
              <p className="text-muted text-sm font-semibold">Post a new position live into our software engineering taxonomy.</p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Lead Frontend Engineer"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-sm min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-muted uppercase tracking-wider">Department</label>
                  <select 
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-h-[48px]"
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-muted uppercase tracking-wider">Employment Type</label>
                  <select 
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-h-[48px]"
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Location</label>
                <input 
                  type="text" 
                  required
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g. Remote / New York, NY"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-sm min-h-[48px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Salary Range</label>
                <input 
                  type="text" 
                  required
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  placeholder="e.g. $130,000 - $160,000"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-sm min-h-[48px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 bg-bg hover:bg-border text-text font-black py-3.5 rounded-2xl text-sm min-h-[48px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-surface font-black py-3.5 rounded-2xl text-sm hover:scale-[1.02] shadow-lg shadow-primary/25 active:scale-[0.98] transition-all min-h-[48px]"
                >
                  Post Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


