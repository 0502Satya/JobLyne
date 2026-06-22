"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyProfileAction, logoutAction } from "@/features/auth/actions";
import { getJobsAction } from "@/features/auth/jobActions";
import { createJobAction, updateJobAction } from "@/features/company/actions";
import { getRecruiterDashboardAction, postRecruiterCandidateAction } from "@/features/recruiter/actions";
import { toast } from "react-hot-toast";
import { EmptyState } from "@/shared/ui";
import { 
  Network, 
  Columns3, 
  MessageSquare, 
  Users, 
  CreditCard, 
  Settings, 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Folder, 
  MapPin, 
  Banknote, 
  Crown, 
  BriefcaseBusiness, 
  CheckCircle, 
  Mail, 
  SearchX, 
  X 
} from "lucide-react";

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
      applicants: dbJob.applicant_count || 0
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
      toast.error(res.error);
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
      toast.error(res.error);
      loadCompanyDashboardData();
    } else {
      loadCompanyDashboardData();
    }
  };

  // Start chat with candidate
  const handleStartChat = async (recipientId?: string) => {
    if (!recipientId) {
      toast.error("This candidate does not have a user profile established yet.");
      return;
    }

    const { startThreadAction } = await import("@/features/auth/actions");
    const res = await startThreadAction(recipientId);
    if (res.error) {
      toast.error(res.error);
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
      toast.error(res.error);
      loadCompanyDashboardData();
    } else {
      loadCompanyDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="text-text justify-center gap-4 items-center bg-bg flex min-h-screen flex-col">
        <div className="border-t-primary size-12 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="type-label uppercase tracking-widest">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="text-text bg-bg transition-colors flex min-h-screen flex-col">
      
      {/* Dashboard Sticky Header */}
      <header className="border-b border-border px-6 py-4 items-center transition-all sticky z-50 flex top-0 bg-surface justify-between md:px-12">
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-primary items-center gap-2 flex transition-opacity hover:opacity-90">
            <Network size={30} aria-hidden="true" />
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <span className="text-primary px-3 hidden py-1.5 rounded-full type-badge bg-primary/10 md:inline-block">Company Hub</span>
        </div>
        <div className="gap-4 flex items-center">
          <Link href="/company/applicants" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
            <Columns3 size={18} aria-hidden="true" />
            Applicants Pipeline
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <Link href="/company/messages" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
            <MessageSquare size={18} aria-hidden="true" />
            Messages
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <Link href="/company/team" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
            <Users size={18} aria-hidden="true" />
            Team
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <Link href="/company/billing" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
            <CreditCard size={18} aria-hidden="true" />
            Billing
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <Link 
            href="/company/settings/organization" 
            className="justify-center items-center size-11 text-muted transition-colors p-2.5 flex rounded-xl hover:bg-bg hover:text-primary"
            title="Organization Settings"
          >
            <Settings size={24} aria-hidden="true" />
          </Link>
          <div className="h-10 w-px bg-border"></div>
          <div className="flex gap-3 items-center">
            <div className="justify-center cursor-pointer rounded-2xl bg-gradient-to-tr items-center size-11 from-primary text-white shadow-primary/20 shadow-lg to-[var(--color-accent-gradient)] flex">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "CO"}
            </div>
            <div className="hidden text-left lg:block">
              <h4 className="type-ui tracking-tight">{profile?.name || "Company Portal"}</h4>
              <p className="text-xs uppercase tracking-widest text-muted">{profile?.industry || "Unverified"}</p>
            </div>
          </div>
          <button 
            onClick={() => logoutAction()} 
            className="rounded-xl min-h-[44px] py-3 transition-colors type-badge px-4 hover:text-red-500 hover:bg-red-500/5 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="border-b py-1 px-6 border-border bg-surface md:px-12">
        <div className="no-scrollbar scroll-smooth mx-auto max-w-7xl overflow-x-auto gap-2 flex">
          {(["overview", "jobs", "sourcing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[48px] tracking-tight py-4 uppercase border-b-2 items-center transition-all gap-2 whitespace-nowrap type-ui flex px-5 ${
                activeTab === tab 
                  ? "text-primary border-primary" 
                  : "border-transparent text-muted hover:text-text hover:border-border"
              }`}
            >
              {tab === "overview" && <LayoutDashboard size={18} aria-hidden="true" />}
              {tab === "jobs" && <Briefcase size={18} aria-hidden="true" />}
              {tab === "sourcing" && <Search size={18} aria-hidden="true" />}
              {tab === "overview" ? "Overview" : tab === "jobs" ? "Jobs Hub" : "AI Sourcing"}
            </button>
          ))}
        </div>
      </div>

      <main className="w-full space-y-8 mx-auto max-w-7xl flex-1 box-sizing p-6 md:p-12">
        
        {/* Profile Completion Warning Notification */}
        {isProfileIncomplete && (
          <div className="bg-gradient-to-r max-w-full slide-in-from-top-4 rounded-3xl items-center flex-col animate-in gap-6 p-6 duration-500 from-warning/10 flex justify-between border-warning/30 to-warning/5 border md:flex-row">
            <div className="flex gap-5 flex-wrap items-center md:flex-nowrap">
              {/* Circular Gauge */}
              <div className="justify-center shrink-0 relative items-center flex size-16">
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
                <span className="text-warning type-badge absolute">{completeness}%</span>
              </div>
              <div className="break-word max-w-[100%] space-y-1 overflow-wrap">
                <h4 className="text-text text-base">Complete your profile credentials</h4>
                <p className="max-w-xl type-label">
                  Profiles at 100% completion receive a verification badge, increasing developer application rates by up to 250%. Add missing culture details and HQ coordinates.
                </p>
              </div>
            </div>
            <Link 
              href="/company/settings/organization" 
              className="w-full justify-center min-h-[48px] px-6 rounded-2xl py-3.5 whitespace-nowrap transition-all shadow-warning/20 items-center type-ui flex shadow-xl bg-warning text-on-warning hover:scale-[1.03] active:scale-[0.98] md:w-auto"
            >
              Complete Workspace
            </Link>
          </div>
        )}

        {/* Tab Content Rendering */}
        {activeTab === "overview" && (
          <div className="fade-in animate-in space-y-8 duration-300">
            {/* Welcome Banner */}
            <section className="bg-gradient-to-r rounded-card max-w-full relative overflow-hidden from-primary shadow-primary/25 shadow-2xl to-[var(--color-accent-gradient)] p-8 text-white md:p-12">
              <div className="space-y-5 relative z-10">
                <div className="bg-white/10 inline-flex items-center backdrop-blur-md gap-2 py-1.5 rounded-full border-white/15 px-4 border">
                  <span className="animate-ping rounded-full size-2 bg-emerald-400"></span>
                  <span className="text-xs tracking-widest uppercase">System Operational</span>
                </div>
                <h1 className="type-h1">
                  {getGreeting()}{profile?.name ? `, ${profile.name}` : ""}!
                </h1>
                <p className="max-w-2xl leading-relaxed text-white/90 type-body md:text-lg">
                  Your workspace is synchronized. You currently have {jobs.filter(j => j.status === "Active").length} active engineer pipelines with new applications ready for review.
                </p>
                <div className="gap-4 flex flex-wrap pt-4">
                  <button 
                    onClick={() => { setActiveTab("jobs"); setShowJobModal(true); }}
                    className="text-primary min-h-[48px] px-6 py-4 rounded-2xl items-center transition-all gap-2 flex bg-surface hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
                  >
                    <PlusCircle size={18} aria-hidden="true" />
                    Post Live Position
                  </button>
                  <button 
                    onClick={() => setActiveTab("sourcing")}
                    className="bg-white/10 min-h-[48px] px-6 py-4 rounded-2xl backdrop-blur-md transition-all border-white/20 text-white border hover:scale-[1.03] hover:bg-white/20 active:scale-[0.98]"
                  >
                    Launch Sourcing
                  </button>
                </div>
              </div>
              {/* Decorative dynamic circles */}
              <div className="blur-3xl bg-white/5 translate-x-1/3 size-96 absolute rounded-full -translate-y-1/2 right-0 top-0"></div>
              <div className="blur-3xl size-80 absolute bg-black/10 rounded-full -bottom-20 -left-20"></div>
            </section>

            {/* Quick Summary Cards */}
            <section className="gap-6 grid grid-cols-1 md:grid-cols-3">
              {[
                { title: "Active Positions", count: jobs.filter(j => j.status === "Active").length, icon: Briefcase, color: "text-info", bg: "bg-info/10", border: "border-info/20", trend: "Interactive" },
                { title: "Developer Pool", count: candidates.length, icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", trend: "Live database" },
                { title: "Interviews Booked", count: candidates.filter(c => c.interviewStatus === "Invited").length, icon: Calendar, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", trend: "Active pipeline" },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} className={`bg-surface border ${stat.border} group rounded-3xl relative transition-all shadow-sm duration-300 p-8 hover:shadow-lg`}>
                    <div className="flex mb-6 items-start justify-between">
                      <div className={`rounded-2xl size-14 ${stat.bg} justify-center items-center transition-transform duration-300 flex group-hover:scale-110`}>
                        <StatIcon className={stat.color} size={24} aria-hidden="true" />
                      </div>
                      <span className="text-text tracking-tight type-h1">{stat.count}</span>
                    </div>
                    <h4 className="type-label uppercase tracking-wider mb-1">{stat.title}</h4>
                    <div className="type-badge gap-1.5 items-center text-emerald-500 flex">
                      <TrendingUp size={14} aria-hidden="true" />
                      {stat.trend}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Layout Split: Live jobs & Sourcing widgets */}
            <div className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
              
              {/* Left 2 Columns: Live postings */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="type-h2">Active Postings Overview</h3>
                  <button 
                    onClick={() => setActiveTab("jobs")} 
                    className="text-primary gap-1 items-center type-ui flex hover:underline"
                  >
                    View All Positions <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="border-border gap-4 rounded-2xl items-start transition-all flex-col p-6 flex justify-between bg-surface border hover:border-primary/40 md:flex-row md:items-center">
                      <div className="space-y-1">
                        <div className="flex gap-2.5 flex-wrap items-center">
                          <h4 className="text-text text-base">{job.title}</h4>
                          <span className={`py-1 px-2.5 rounded-full type-badge ${
                            job.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-warning/10 text-warning"
                          }`}>{job.status}</span>
                        </div>
                        <p className="tracking-tight type-caption text-muted">{job.department} &bull; {job.location} &bull; {job.salary}</p>
                      </div>
                      <div className="w-full gap-4 items-center flex justify-between md:justify-end md:w-auto">
                        <div className="text-right">
                          <span className="text-text block text-base">{job.applicants}</span>
                          <span className="text-xs uppercase tracking-widest text-muted">Applicants</span>
                        </div>
                        <button 
                          onClick={() => toggleJobStatus(job.id)}
                          className="text-text min-h-[40px] type-caption bg-bg transition-all py-2.5 px-4 rounded-xl hover:bg-primary hover:text-white"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <EmptyState
                      title="No active listings found"
                      description="Create a requisition to get started with recruitment."
                      icon="work_off"
                      actionLabel="Create Requisition"
                      onAction={() => { setActiveTab("jobs"); setShowJobModal(true); }}
                      className="w-full max-w-lg mt-4"
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Mini candidate cards */}
              <div className="space-y-6">
                <h3 className="type-h2">Hot Talent Picks</h3>
                <div className="border-border rounded-3xl p-6 space-y-4 bg-surface border">
                  {candidates.slice(0, 2).map((c) => (
                    <div key={c.id} className="space-y-3 border-b pb-4 border-border last:border-0 last:pb-0">
                      <div className="flex gap-3 items-center">
                        <div className={`size-10 rounded-xl ${c.avatarColor} justify-center shadow-md items-center text-white flex`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-text type-ui">{c.name}</h4>
                          <p className="type-caption text-muted">{c.role}</p>
                        </div>
                      </div>
                      <div className="gap-1 flex flex-wrap">
                        {c.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 uppercase text-xs bg-bg rounded-full py-0.5 text-muted">{s}</span>
                        ))}
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="px-2 text-primary py-1 rounded-full type-badge bg-primary/10">{c.matchScore}% Match</span>
                        <button 
                          onClick={() => setActiveTab("sourcing")}
                          className="items-center gap-1 transition-colors flex type-caption text-muted hover:text-primary"
                        >
                          Source <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="py-4 text-center type-caption text-muted">
                      Loading sourcing picks...
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Support section */}
            <section className="rounded-card border-dashed max-w-full border-border gap-8 items-center flex-col flex justify-between p-8 bg-surface border md:flex-row">
              <div className="break-word max-w-full space-y-2 text-center overflow-wrap md:text-left">
                <h3 className="text-text type-h2">Access talent intelligence specialists</h3>
                <p className="max-w-lg type-label">Need dedicated guidance? Our staffing specialists can assist you in composing the ideal JD and vetting workflows.</p>
              </div>
              <div className="w-full flex gap-3 flex-col sm:flex-row md:w-auto">
                <button 
                  onClick={() => toast.success("Staffing guidebook downloaded!")}
                  className="w-full text-text min-h-[48px] border-border px-6 py-4 rounded-2xl bg-bg transition-all type-ui border hover:shadow-lg hover:bg-surface sm:w-auto"
                >
                  Documentation Guide
                </button>
                <button 
                  onClick={() => toast.success("Talent strategist has been notified! We will contact you within 2 business hours.")}
                  className="w-full min-h-[48px] px-6 py-4 rounded-2xl transition-all type-ui bg-primary text-white hover:scale-[1.03] sm:w-auto"
                >
                  Contact Support
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Job management hub */}
        {activeTab === "jobs" && (
          <div className="fade-in animate-in space-y-6 duration-300">
            <div className="gap-4 flex justify-between flex-col sm:flex-row sm:items-center">
              <div>
                <h2 className="type-h2">Active Postings Hub</h2>
                <p className="type-label">Monitor applications, modify status flags, and post new open requisitions.</p>
              </div>
              <button 
                onClick={() => setShowJobModal(true)}
                className="justify-center min-h-[48px] px-6 rounded-2xl py-3.5 items-center transition-all gap-2 bg-primary flex text-white hover:scale-[1.03]"
              >
                <PlusCircle size={18} aria-hidden="true" />
                New Requisition
              </button>
            </div>

            <div className="gap-4 grid grid-cols-1">
              {jobs.map((job) => (
                <div key={job.id} className="border-border rounded-3xl items-start transition-all shadow-sm flex-col gap-6 flex justify-between p-8 bg-surface border hover:shadow-md md:flex-row md:items-center">
                  <div className="space-y-2">
                    <div className="flex gap-3 flex-wrap items-center">
                      <h3 className="text-text type-h2">{job.title}</h3>
                      <span className={`py-1 px-2.5 rounded-full type-badge ${
                        job.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : job.status === "Draft" ? "bg-warning/10 text-warning" : "text-red-500 bg-red-500/10"
                      }`}>{job.status}</span>
                    </div>
                    <div className="type-label items-center flex-wrap gap-3 flex">
                      <span className="gap-1 flex items-center"><Folder size={16} aria-hidden="true" />{job.department}</span>
                      <span>&bull;</span>
                      <span className="gap-1 flex items-center"><MapPin size={16} aria-hidden="true" />{job.location}</span>
                      <span>&bull;</span>
                      <span className="gap-1 flex items-center"><Banknote size={16} aria-hidden="true" />{job.salary}</span>
                    </div>
                  </div>

                  <div className="w-full border-t border-border gap-4 items-center flex pt-4 justify-between md:border-t-0 md:justify-end md:w-auto md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-text type-h2 block">{job.applicants}</span>
                      <span className="uppercase tracking-widest type-caption text-muted">Active Applicants</span>
                    </div>
                    <div className="gap-2 flex items-center">
                      <button 
                        onClick={() => toggleJobStatus(job.id)}
                        className="text-text rounded-2xl min-h-[44px] bg-bg transition-all py-3 type-ui px-5 hover:bg-primary hover:text-white"
                      >
                        Toggle State
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <EmptyState
                  title="No live postings found"
                  description="Create a requisition to attract elite engineering candidates."
                  icon="work_off"
                  actionLabel="New Requisition"
                  onAction={() => setShowJobModal(true)}
                  className="w-full max-w-lg mt-6"
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Talent sourcing and matchmaking */}
        {activeTab === "sourcing" && (
          <div className="fade-in animate-in space-y-8 duration-300">
            <div>
              <h2 className="type-h2">AI Talent Sourcing Portal</h2>
              <p className="type-label">Match instantly with top tier software engineers, designers, and managers.</p>
            </div>

            {/* Sourcing filters */}
            <div className="border-border gap-4 rounded-3xl items-center flex-col p-6 flex bg-surface border md:flex-row">
              <div className="w-full relative flex-1">
                <Search className="left-4 absolute top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, skills, location (e.g. Next.js, Stripe, Remote)..."
                  className="w-full outline-none pl-12 min-h-[48px] border-border rounded-2xl py-3.5 bg-bg transition-all type-ui pr-4 border focus:ring-2 focus:ring-primary"
                />
              </div>
              <button 
                onClick={() => setSearchQuery("")}
                className="w-full text-text min-h-[48px] px-6 rounded-2xl py-3.5 whitespace-nowrap bg-bg transition-all type-ui hover:bg-border md:w-auto"
              >
                Clear Filters
              </button>
            </div>

            {/* Candidate list */}
            <div className="gap-6 grid grid-cols-1">
              {candidates
                .filter(c => {
                  const term = searchQuery.toLowerCase();
                  return c.name.toLowerCase().includes(term) || 
                         c.role.toLowerCase().includes(term) || 
                         c.skills.some(s => s.toLowerCase().includes(term)) ||
                         c.location.toLowerCase().includes(term);
                })
                .map((c) => (
                  <div key={c.id} className="border-border rounded-3xl items-start transition-all shadow-sm flex-col gap-6 duration-300 flex justify-between p-8 bg-surface border hover:shadow-lg lg:flex-row">
                    <div className="flex-1 space-y-4">
                      
                      {/* Core header */}
                      <div className="gap-4 flex items-start">
                        <div className={`rounded-2xl size-14 ${c.avatarColor} justify-center shrink-0 shadow-md type-card-title items-center text-white flex`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex gap-3 flex-wrap items-center">
                            <h3 className="text-text type-h2 leading-tight">{c.name}</h3>
                            <span className="py-1 text-primary type-badge gap-1.5 px-3 items-center rounded-full flex bg-primary/10">
                              <Crown size={14} aria-hidden="true" />
                              {c.matchScore}% Match
                            </span>
                          </div>
                          <p className="type-label tracking-tight">{c.role} &bull; {c.experience} Exp</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="type-label max-w-2xl leading-relaxed">{c.bio}</p>

                      {/* Skill badges */}
                      <div className="gap-2 flex flex-wrap pt-2">
                        {c.skills.map((skill, idx) => (
                          <span key={idx} className="text-text border-border uppercase px-3 bg-bg py-1.5 rounded-full type-badge border">{skill}</span>
                        ))}
                      </div>

                      {/* Details row */}
                      <div className="gap-4 items-center pt-2 flex type-caption text-muted">
                        <span className="gap-1 flex items-center"><MapPin size={14} aria-hidden="true" />{c.location}</span>
                        <span>&bull;</span>
                        <span className="gap-1 flex items-center"><BriefcaseBusiness size={14} aria-hidden="true" />{c.experience}</span>
                      </div>

                    </div>

                    {/* Interactive CTAs */}
                    <div className="lg:pl-8 lg:w-64 lg:pt-0 lg:border-l w-full shrink-0 border-border gap-3 flex pt-4 flex-col">
                      <div className="pb-2 text-left space-y-1 lg:text-right">
                        <span className="block type-badge text-muted">Status</span>
                        <span className={`type-badge uppercase ${
                          c.interviewStatus === "Invited" ? "text-emerald-500" : "text-muted"
                        }`}>
                          {c.interviewStatus === "Invited" ? "Interview Requested" : "Open to Sourcing"}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleInviteCandidate(c.id)}
                        disabled={c.interviewStatus === "Invited"}
                        className={`w-full justify-center min-h-[48px] rounded-2xl py-3.5 items-center gap-2 transition-all type-ui flex px-4 active:scale-[0.98] ${
                          c.interviewStatus === "Invited" 
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 cursor-default border" 
                            : "bg-primary shadow-lg text-white shadow-primary/10 hover:scale-[1.02]"
                        }`}
                      >
                        {c.interviewStatus === "Invited" ? (
                          <CheckCircle size={18} aria-hidden="true" />
                        ) : (
                          <Mail size={18} aria-hidden="true" />
                        )}
                        {c.interviewStatus === "Invited" ? "Invited" : "Request Interview"}
                      </button>

                      <button
                        onClick={() => handleStartChat(c.user_id)}
                        className="w-full text-text justify-center type-badge min-h-[48px] gap-1.5 border-border rounded-2xl py-3.5 items-center transition-all flex px-4 bg-surface border hover:bg-bg active:scale-[0.98]"
                      >
                        <MessageSquare size={14} aria-hidden="true" />
                        Send Message
                      </button>

                      <button 
                        onClick={() => {
                          postRecruiterCandidateAction(c.id, 'toggle_shortlist');
                          toast.success(`${c.name} saved to workspace portfolio!`);
                        }}
                        className="w-full text-text min-h-[48px] rounded-2xl py-3.5 bg-bg transition-all type-ui px-4 hover:bg-border"
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
                <div className="border-border rounded-3xl p-12 text-center space-y-4 bg-surface border">
                  <SearchX className="text-muted mx-auto" size={48} aria-hidden="true" />
                  <div className="space-y-1">
                    <h4 className="type-card-title">No engineers found matching filter</h4>
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
        <div className="justify-center fade-in inset-0 items-center duration-200 animate-in flex backdrop-blur-sm p-6 z-50 bg-black/60 fixed">
          <div className="w-full rounded-card overflow-y-auto border-border relative duration-200 animate-in max-h-[90vh] shadow-2xl zoom-in-95 max-w-xl p-8 bg-surface border">
            <button 
              onClick={() => setShowJobModal(false)}
              className="min-h-[40px] justify-center rounded-xl min-w-[40px] absolute items-center p-2 right-6 flex top-6 text-muted hover:bg-bg hover:text-text"
              aria-label="Close modal"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="space-y-2 mb-6">
              <h3 className="type-h2">Create Job Requisition</h3>
              <p className="type-label">Post a new position live into our software engineering taxonomy.</p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-5">
              <div className="space-y-1.5">
                <label className="type-badge">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Lead Frontend Engineer"
                  className="w-full outline-none min-h-[48px] border-border bg-bg py-3 type-ui px-4 rounded-xl border focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="type-badge">Department</label>
                  <select 
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full outline-none min-h-[48px] border-border bg-bg py-3 type-ui px-4 rounded-xl border focus:ring-2 focus:ring-primary"
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="type-badge">Employment Type</label>
                  <select 
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="w-full outline-none min-h-[48px] border-border bg-bg py-3 type-ui px-4 rounded-xl border focus:ring-2 focus:ring-primary"
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="type-badge">Location</label>
                <input 
                  type="text" 
                  required
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g. Remote / New York, NY"
                  className="w-full outline-none min-h-[48px] border-border bg-bg py-3 type-ui px-4 rounded-xl border focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-badge">Salary Range</label>
                <input 
                  type="text" 
                  required
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  placeholder="e.g. $130,000 - $160,000"
                  className="w-full outline-none min-h-[48px] border-border bg-bg py-3 type-ui px-4 rounded-xl border focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowJobModal(false)}
                  className="text-text flex-1 min-h-[48px] rounded-2xl py-3.5 bg-bg type-ui hover:bg-border"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 min-h-[48px] rounded-2xl py-3.5 transition-all type-ui shadow-lg shadow-primary/25 bg-primary text-white hover:scale-[1.02] active:scale-[0.98]"
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


