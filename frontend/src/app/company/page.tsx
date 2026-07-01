"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyProfileAction, logoutAction, updateCompanyProfileAction } from "@/features/auth/actions";
import { getJobsAction } from "@/features/auth/jobActions";
import { createJobAction, updateJobAction, deleteJobAction, uploadCompanyDocAction } from "@/features/company/actions";
import { getRecruiterDashboardAction, postRecruiterCandidateAction } from "@/features/recruiter/actions";
import { toast } from "react-hot-toast";
import { EmptyState, Dialog, Button } from "@/shared/ui";
import VerificationWizard from "@/features/company/components/VerificationWizard";
import CompanyApplicantsSection from "@/features/company/components/CompanyApplicantsSection";
import { 
  Network, 
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
  X,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Building2,
  Trash2,
  Copy,
  Plus,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Clock,
  ArrowLeftRight
} from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
  raw_data?: any;
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
  
  // Navigation Section State
  const [activeSection, setActiveSection] = useState<"dashboard" | "jobs" | "candidates" | "analytics" | "profile" | "settings" | "verification" | "applicants">("dashboard");
  const [applicantsJobFilter, setApplicantsJobFilter] = useState<string>("ALL");
  
  // Jobs List & Filters State
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState<"All" | "Active" | "Draft" | "Closed">("All");
  const [jobDeptFilter, setJobDeptFilter] = useState("All");
  const [jobLocFilter, setJobLocFilter] = useState("All");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");

  // Sourcing Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateSearch, setCandidateSearch] = useState("");

  // Create Job Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [successJobId, setSuccessJobId] = useState<string | null>(null);

  // Step Form Fields
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "Engineering",
    location: "Remote",
    workMode: "Remote" as "Remote" | "Hybrid" | "Onsite",
    employmentType: "Full-time",
    skills: [] as string[],
    newSkillInput: "",
    experience: 3,
    education: "Bachelor's Degree",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    noticePeriod: "Immediate",
    aboutCompany: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    deadline: "",
    openings: 1,
    resumeRequired: true,
    coverLetterOptional: true,
    autoClose: false
  });

  // Company Profile Update State
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      social_links: {
        ...prev?.social_links,
        [name]: value
      }
    }));
  };

  const handleProfileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check: 5mb
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const validExtensions = ["image/jpeg", "image/png", "image/jpg"];
    if (!validExtensions.includes(file.type)) {
      toast.error("Invalid file format. Only JPG and PNG images are allowed.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    const result = await uploadCompanyDocAction(uploadData);
    if (result.error) {
      toast.error(result.error);
    } else if (result.file_url) {
      setProfile((prev: any) => ({ ...prev, [fieldName]: result.file_url }));
      toast.success("Image uploaded successfully.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    const res = await updateCompanyProfileAction({
      name: profile.name,
      industry: profile.industry,
      website: profile.website,
      description: profile.description,
      city: profile.city || "",
      country: profile.country || "",
      company_size: profile.company_size || "11-50",
      year_established: profile.year_established || 2020,
      authorized_contact_name: profile.authorized_contact_name || "",
      authorized_contact_designation: profile.authorized_contact_designation || "",
      culture: profile.culture || "",
      benefits: profile.benefits || "",
      logo_url: profile.logo_url || "",
      cover_image_url: profile.cover_image_url || "",
      social_links: profile.social_links || {}
    });
    setSavingProfile(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Company profile updated successfully!");
      await loadCompanyDashboardData();
    }
  };

  const loadCompanyDashboardData = async () => {
    try {
      const profileData = await getCompanyProfileAction();
      if (!profileData.error) {
        setProfile(profileData);
        // Default Step 3 Company Description if empty
        if (profileData.description && !jobForm.aboutCompany) {
          setJobForm(prev => ({ ...prev, aboutCompany: profileData.description }));
        }
      }

      // Fetch corporate jobs
      const jobsData = await getJobsAction({ my_jobs: "true" });
      if (!jobsData.error) {
        const jobsArray = Array.isArray(jobsData) ? jobsData : (jobsData.results || []);
        const mappedJobs = jobsArray.map((dbJob: any): JobPost => {
          let statusMapped: JobPost["status"] = "Active";
          if (dbJob.status === "CLOSED") statusMapped = "Closed";
          else if (dbJob.status === "DRAFT") statusMapped = "Draft";

          return {
            id: dbJob.id,
            title: dbJob.title || "Untitled Role",
            department: dbJob.description?.includes("Department:") 
              ? dbJob.description.split("Department:")[1]?.split("\n")[0]?.trim() || "Engineering" 
              : "Engineering",
            location: dbJob.location || dbJob.raw_location || "Remote",
            type: dbJob.employment_type || "Full-time",
            salaryMin: Number(dbJob.salary_min || 0),
            salaryMax: Number(dbJob.salary_max || 0),
            currency: dbJob.currency || "USD",
            status: statusMapped,
            applicants: dbJob.applicant_count || 0,
            raw_data: dbJob
          };
        });
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

  // Compute stats metrics dynamically
  const statsMetrics = useMemo(() => {
    const active = jobs.filter(j => j.status === "Active").length;
    const drafts = jobs.filter(j => j.status === "Draft").length;
    const apps = jobs.reduce((sum, j) => sum + j.applicants, 0);
    const shortlisted = candidates.filter(c => c.isShortlisted || c.status === "Interviewing").length;
    const hired = candidates.filter(c => c.status === "Placed" || c.status === "Offered").length;

    return { active, drafts, apps, shortlisted, hired };
  }, [jobs, candidates]);

  // Tag list helper actions
  const addSkillTag = () => {
    const val = jobForm.newSkillInput.trim();
    if (val && !jobForm.skills.includes(val)) {
      setJobForm({
        ...jobForm,
        skills: [...jobForm.skills, val],
        newSkillInput: ""
      });
    }
  };

  const removeSkillTag = (tag: string) => {
    setJobForm({
      ...jobForm,
      skills: jobForm.skills.filter(s => s !== tag)
    });
  };

  // Submit flow — Wizard handlers
  const handleWizardSubmit = async (status: "OPEN" | "DRAFT") => {
    // Generate beautiful markdown JDs to save to plain text description
    const formattedDescription = `
### About Company
${jobForm.aboutCompany || "Not specified."}

### Responsibilities
${jobForm.responsibilities || "Not specified."}

### Requirements
${jobForm.requirements || "Not specified."}

### Benefits
${jobForm.benefits || "Not specified."}

---
Department: ${jobForm.department}
Work Mode: ${jobForm.workMode}
Notice Period: ${jobForm.noticePeriod}
Deadline: ${jobForm.deadline || "None"}
Openings: ${jobForm.openings}
Auto Close: ${jobForm.autoClose ? "Yes" : "No"}
Resume Required: ${jobForm.resumeRequired ? "Yes" : "No"}
Cover Letter Optional: ${jobForm.coverLetterOptional ? "Yes" : "No"}
`.trim();

    // Generate JSON structured requirements to support parsing
    const structuredRequirements = JSON.stringify({
      education: jobForm.education,
      noticePeriod: jobForm.noticePeriod,
      openings: jobForm.openings,
      deadline: jobForm.deadline,
      resumeRequired: jobForm.resumeRequired,
      coverLetterOptional: jobForm.coverLetterOptional,
      skills: jobForm.skills
    });

    const payload = {
      title: jobForm.title,
      description: formattedDescription,
      requirements: structuredRequirements,
      location: jobForm.location,
      employment_type: jobForm.employmentType,
      experience_required: jobForm.experience.toString(),
      salary_min: jobForm.salaryMin ? parseFloat(jobForm.salaryMin) : undefined,
      salary_max: jobForm.salaryMax ? parseFloat(jobForm.salaryMax) : undefined,
      skills: jobForm.skills,
      currency: jobForm.currency,
      status: status
    };

    setLoading(true);
    let res;
    if (editingJobId) {
      res = await updateJobAction(editingJobId, payload);
    } else {
      res = await createJobAction(payload);
    }

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success(editingJobId ? "Job requisition updated successfully!" : "New job published live!");
      setShowWizard(false);
      setSuccessJobId(res.data?.id || editingJobId);
      
      // Reset wizard
      setEditingJobId(null);
      setWizardStep(1);
      
      // Load fresh list
      await loadCompanyDashboardData();
      
      if (status === "OPEN") {
        setWizardSuccess(true);
      }
    }
  };

  // Job Listing actions
  const handleEditJob = (job: JobPost) => {
    window.open(`/create-job?id=${job.id}`, "_blank");
  };

  const handleDuplicateJob = (job: JobPost) => {
    window.open(`/create-job?duplicateId=${job.id}`, "_blank");
  };

  const handleToggleArchive = async (id: string, currentStatus: "Active" | "Closed" | "Draft") => {
    const nextStatus = currentStatus === "Active" ? "CLOSED" : "OPEN";
    setLoading(true);
    const res = await updateJobAction(id, { status: nextStatus });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(currentStatus === "Active" ? "Position archived successfully" : "Position reinstated live");
      await loadCompanyDashboardData();
    }
    setLoading(false);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this job requisition? This action is irreversible.")) return;
    setLoading(true);
    const res = await deleteJobAction(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Job requisition deleted permanently");
      await loadCompanyDashboardData();
    }
    setLoading(false);
  };

  // Invite candidate action
  const handleInviteCandidate = async (candidateId: string) => {
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, interviewStatus: "Invited", status: "Interviewing" } : c)
    );
    const res = await postRecruiterCandidateAction(candidateId, 'invite');
    if (res.error) {
      toast.error(res.error);
      loadCompanyDashboardData();
    } else {
      toast.success("Interview request invitation delivered!");
      loadCompanyDashboardData();
    }
  };

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

  // Filter lists dynamically
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                            job.department.toLowerCase().includes(jobSearch.toLowerCase());
      
      const matchesStatus = jobStatusFilter === "All" ||
                            (jobStatusFilter === "Active" && job.status === "Active") ||
                            (jobStatusFilter === "Draft" && job.status === "Draft") ||
                            (jobStatusFilter === "Closed" && job.status === "Closed");

      const matchesDept = jobDeptFilter === "All" || job.department === jobDeptFilter;
      const matchesLoc = jobLocFilter === "All" || job.location.toLowerCase().includes(jobLocFilter.toLowerCase());
      const matchesType = jobTypeFilter === "All" || job.type === jobTypeFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesLoc && matchesType;
    });
  }, [jobs, jobSearch, jobStatusFilter, jobDeptFilter, jobLocFilter, jobTypeFilter]);

  // Unique filter lists for dropdown options
  const filterOptions = useMemo(() => {
    const depts = Array.from(new Set(jobs.map(j => j.department)));
    const types = Array.from(new Set(jobs.map(j => j.type)));
    return { depts, types };
  }, [jobs]);

  // Completeness metric
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 20;
    if (profile.description) score += 20;
    if (profile.industry) score += 20;
    if (profile.website) score += 20;
    if (profile.city || profile.country) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();
  const isProfileIncomplete = completeness < 100 && profile?.verification_status !== "verified";

  return (
    <div className="text-text bg-bg min-h-screen flex text-left transition-colors font-sans">
      
      {/* 1. Left sticky navigation sidebar */}
      <aside className="w-64 border-r border-border/60 bg-surface flex flex-col fixed top-0 bottom-0 left-0 overflow-y-auto z-40">
        <div className="p-6 border-b border-border/40 flex items-center gap-3">
          <div className="bg-primary rounded-xl text-white p-2 shadow-md shadow-primary/20">
            <Network size={22} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block">JobLyne</span>
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest block -mt-0.5">Corporate</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "jobs", label: "Jobs Hub", icon: Briefcase },
            { id: "applicants", label: "Applicants", icon: FileText },
            { id: "candidates", label: "AI Sourcing", icon: Users },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "profile", label: "Company Profile", icon: Building2 },
            { id: "verification", label: "Verify Workspace", icon: ShieldCheck },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(item => {
            const ItemIcon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  setWizardSuccess(false);
                  if (item.id === "applicants") {
                    setApplicantsJobFilter("ALL");
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl type-ui transition-all text-left cursor-pointer ${
                  isActive 
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/10" 
                    : "text-muted hover:text-text hover:bg-bg"
                }`}
              >
                <ItemIcon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Profile Card Bottom Info */}
        <div className="p-4 border-t border-border/40 bg-bg/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-primary items-center justify-center text-white font-bold flex shadow-md shrink-0">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "CO"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="type-ui text-sm font-semibold truncate">
                {profile?.name || "Corporate Admin"}
              </h4>
              <p className="text-[10px] text-muted uppercase tracking-wider truncate">{profile?.industry || "Software Vendor"}</p>
            </div>
          </div>
          <button
            onClick={() => logoutAction()}
            className="w-full justify-center min-h-[40px] border border-border/60 hover:border-error/20 py-2.5 rounded-xl type-caption hover:bg-error-bg/20 hover:text-error text-center flex cursor-pointer transition-colors font-bold text-xs"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main workspace panels */}
      <main className="flex-1 overflow-x-hidden p-8 md:p-12 space-y-8 ml-64">
        
        {/* Dynamic header title block */}
        <div className="flex justify-between items-start flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text capitalize">
              {activeSection === "jobs" ? "Jobs Hub" : activeSection === "profile" ? "Company Profile" : activeSection === "verification" ? "Verify Workspace" : activeSection}
            </h1>
            <p className="text-muted text-sm mt-1">
              {activeSection === "dashboard" && "Real-time requisition stats, conversion funnels, and hot developer matches."}
              {activeSection === "jobs" && "Draft, publish, filter, and duplicate active company job openings."}
              {activeSection === "candidates" && "Match and connect instantly with elite software developers."}
              {activeSection === "analytics" && "Evaluate applicant pipeline performance and matches conversions."}
              {activeSection === "profile" && "Manage organization name, descriptions, culture, and HQ coordinates."}
              {activeSection === "verification" && "Submit corporate registration documents, check domain records, and build trust score badges."}
              {activeSection === "settings" && "Invite team sub-roles and update billing configurations."}
            </p>
          </div>

          {(activeSection === "dashboard" || activeSection === "jobs") && (
            <button
              onClick={() => {
                if (profile?.verification_status !== "verified") {
                  toast.error("Organization not verified yet. Submit credentials in settings to unlock job posting.");
                } else {
                  window.open("/create-job", "_blank");
                }
              }}
              className="px-5 py-3 rounded-2xl bg-primary text-white font-bold items-center gap-2 flex shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <PlusCircle size={18} />
              Create Job Wizard
            </button>
          )}
        </div>

        {/* PROFILE WARNING */}
        {isProfileIncomplete && (
          <div className="bg-gradient-to-r rounded-2xl p-6 from-warning/10 to-warning/5 border border-warning/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-4 items-center text-left">
              <div className="justify-center size-12 bg-warning-bg rounded-xl flex items-center text-warning shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 className="text-text font-bold text-sm">Verify workspace organization detail completeness</h4>
                <p className="type-caption text-muted text-xs max-w-xl">
                  Your profile completion score is currently at {completeness}%. Complete profile info, HQ addresses, and verified domains to increase applicant confidence.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveSection("verification")} 
              className="px-4 py-2.5 bg-warning text-on-warning font-bold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Update Credentials
            </button>
          </div>
        )}

        {/* SECTION: 1. DASHBOARD */}
        {activeSection === "dashboard" && !wizardSuccess && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { label: "Active Jobs", value: statsMetrics.active, color: "text-info", bg: "bg-info-bg", border: "border-info/20" },
                { label: "Draft Jobs", value: statsMetrics.drafts, color: "text-warning", bg: "bg-warning-bg", border: "border-warning/20" },
                { label: "Applications Received", value: statsMetrics.apps, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                { label: "Shortlisted", value: statsMetrics.shortlisted, color: "text-success", bg: "bg-success-bg", border: "border-success/20" },
                { label: "Hired Candidates", value: statsMetrics.hired, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" }
              ].map((stat, i) => (
                <div key={i} className={`bg-surface p-6 rounded-2xl border ${stat.border} shadow-sm space-y-2`}>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">{stat.label}</span>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-3xl font-extrabold text-text leading-none">{stat.value}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${stat.bg} ${stat.color}`}>LIVE</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Sourcing Overview Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-surface border border-border/60 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="text-base font-bold text-text">Pipeline Throughput Funnel</h3>
                  <button onClick={() => setActiveSection("analytics")} className="text-primary type-caption font-bold hover:underline flex items-center gap-1 text-xs cursor-pointer">
                    View funnel analytics <ChevronRight size={14} />
                  </button>
                </div>
                
                {/* Simulated funnel graphics */}
                <div className="space-y-4 pt-2">
                  {[
                    { stage: "Applications Received", count: statsMetrics.apps, width: "100%", bg: "bg-primary" },
                    { stage: "Screened / Sourced", count: Math.ceil(statsMetrics.apps * 0.7), width: "70%", bg: "bg-info" },
                    { stage: "Interview Stage", count: statsMetrics.shortlisted, width: "40%", bg: "bg-warning" },
                    { stage: "Offers / Hires Made", count: statsMetrics.hired, width: "15%", bg: "bg-success" }
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-muted">
                        <span>{row.stage}</span>
                        <span className="font-bold text-text">{row.count} candidate{row.count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-6 w-full bg-bg rounded-lg overflow-hidden flex items-center pr-3">
                        <div className={`h-full ${row.bg} rounded-l-lg transition-all duration-1000 flex items-center pl-3 text-[10px] text-white font-bold`} style={{ width: row.width }}>
                          {row.width}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hot Talent Picks card */}
              <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="text-base font-bold text-text">Developer Matches</h3>
                  <button onClick={() => setActiveSection("candidates")} className="text-primary type-caption font-bold hover:underline flex items-center gap-1 text-xs cursor-pointer">
                    Source all <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  {candidates.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 pb-3 border-b border-border/30 last:border-0 last:pb-0">
                      <div className={`size-9 rounded-lg ${c.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                        {c.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-text truncate">{c.name}</h4>
                        <p className="text-[10px] text-muted truncate">{c.role}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-primary/10 text-primary font-bold">{c.matchScore}% Match</span>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <p className="text-xs text-muted text-center py-4">No pending candidates matched.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: 2. JOBS LISTING PAGE */}
        {activeSection === "jobs" && !wizardSuccess && (
          <div className="space-y-6">
            {/* Action Bar / Filters */}
            <div className="border border-border/60 bg-surface p-6 rounded-2xl space-y-4">
              <div className="flex gap-4 flex-col lg:flex-row">
                <div className="relative flex-1">
                  <Search className="left-4 absolute top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Search jobs by title or department..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value as any)}
                    className="h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select
                    value={jobDeptFilter}
                    onChange={(e) => setJobDeptFilter(e.target.value)}
                    className="h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option value="All">All Departments</option>
                    {filterOptions.depts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option value="All">All Types</option>
                    {filterOptions.types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setJobSearch("");
                      setJobStatusFilter("All");
                      setJobDeptFilter("All");
                      setJobLocFilter("All");
                      setJobTypeFilter("All");
                    }}
                    className="h-11 px-4 border border-border/60 hover:bg-bg rounded-xl text-xs font-bold text-muted transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitions List */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border border-border/60 bg-surface p-6 rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex gap-2.5 items-center flex-wrap">
                      <h3 className="text-lg font-bold text-text leading-snug">{job.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        job.status === "Active" ? "bg-success-bg text-success" : job.status === "Draft" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted flex-wrap font-medium">
                      <span className="flex items-center gap-1"><Folder size={14} /> {job.department}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Banknote size={14} /> {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : "Negotiable"}</span>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto border-t lg:border-t-0 border-border/40 pt-4 lg:pt-0 flex justify-between lg:justify-end items-center gap-6 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-2xl font-extrabold text-text block leading-none">{job.applicants}</span>
                      <span className="text-[10px] text-muted uppercase font-bold tracking-widest block mt-0.5">Applicants</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="px-3.5 py-2 bg-bg hover:bg-border/30 rounded-xl text-xs font-bold text-text transition-colors cursor-pointer"
                        title="Edit Job"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateJob(job)}
                        className="px-3.5 py-2 bg-bg hover:bg-border/30 rounded-xl text-xs font-bold text-text transition-colors cursor-pointer"
                        title="Duplicate Job"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleToggleArchive(job.id, job.status)}
                        className="px-3.5 py-2 bg-bg hover:bg-border/30 rounded-xl text-xs font-bold text-text transition-colors cursor-pointer"
                        title={job.status === "Active" ? "Archive Job" : "Publish Job"}
                      >
                        {job.status === "Active" ? "Archive" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 bg-bg hover:bg-error-bg/30 text-muted hover:text-error rounded-xl transition-colors cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setApplicantsJobFilter(job.title);
                          setActiveSection("applicants");
                        }}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        View Applicants
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <EmptyState
                  title="No active listings found"
                  description="Adjust your filters or use the wizard above to create a new requisition."
                  icon="work_off"
                />
              )}
            </div>
          </div>
        )}

        {/* SECTION: 2.5 APPLICANTS */}
        {activeSection === "applicants" && (
          <CompanyApplicantsSection initialJobFilter={applicantsJobFilter} />
        )}

        {/* SECTION: 3. CANDIDATES */}
        {activeSection === "candidates" && (
          <div className="space-y-6">
            <div className="border border-border/60 bg-surface p-6 rounded-2xl">
              <div className="relative">
                <Search className="left-4 absolute top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Filter candidate database by name, role, tags or matching titles..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>
            </div>

            <div className="space-y-4">
              {candidates
                .filter(c => {
                  const query = candidateSearch.toLowerCase();
                  return c.name.toLowerCase().includes(query) ||
                         c.role.toLowerCase().includes(query) ||
                         c.skills.some(s => s.toLowerCase().includes(query));
                })
                .map((c) => (
                  <div key={c.id} className="border border-border/60 bg-surface p-8 rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4 items-center flex-wrap">
                        <div className={`size-12 rounded-xl ${c.avatarColor} text-white font-extrabold flex items-center justify-center shadow-sm text-sm`}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-text leading-tight">{c.name}</h3>
                          <p className="text-xs text-muted mt-0.5">{c.role} &bull; {c.experience} Experience &bull; {c.location}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary flex items-center gap-1 ml-2">
                          <Crown size={12} /> {c.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-sm text-text/80 leading-relaxed max-w-3xl font-medium">{c.bio}</p>

                      <div className="gap-2 flex flex-wrap font-semibold">
                        {c.skills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-bg border border-border/30 text-xs font-semibold text-muted rounded-lg uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="w-full lg:w-60 border-t lg:border-t-0 lg:border-l border-border/40 pt-4 lg:pt-0 lg:pl-6 shrink-0 flex flex-col gap-2.5 justify-center">
                      <div className="pb-1 text-left lg:text-right space-y-1">
                        <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Candidate Status</span>
                        <span className={`text-xs font-bold block ${c.interviewStatus === "Invited" ? "text-success" : "text-muted"}`}>
                          {c.interviewStatus === "Invited" ? "Interview Requested" : "Awaiting Actions"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleInviteCandidate(c.id)}
                        disabled={c.interviewStatus === "Invited"}
                        className={`w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          c.interviewStatus === "Invited"
                            ? "bg-success-bg border border-success/30 text-success"
                            : "bg-primary text-white hover:scale-[1.02] shadow-sm shadow-primary/10"
                        }`}
                      >
                        <Mail size={14} />
                        {c.interviewStatus === "Invited" ? "Invited" : "Request Interview"}
                      </button>

                      <button
                        onClick={() => handleStartChat(c.user_id)}
                        className="w-full h-11 border border-border/60 hover:bg-bg rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text transition-colors cursor-pointer"
                      >
                        <MessageSquare size={14} />
                        Send Chat Invite
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SECTION: 4. ANALYTICS */}
        {activeSection === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-text">Applicants Conversion Throughput</h3>
              <div className="h-64 bg-bg/50 rounded-xl flex items-end justify-around p-6">
                {[
                  { label: "Sourced", count: 85, height: "h-[85%]", bg: "bg-primary" },
                  { label: "Screened", count: 52, height: "h-[52%]", bg: "bg-info" },
                  { label: "Interview", count: 28, height: "h-[28%]", bg: "bg-warning" },
                  { label: "Offered", count: 12, height: "h-[12%]", bg: "bg-success" }
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-12">
                    <span className="text-[10px] text-text font-bold">{col.count}%</span>
                    <div className={`w-full ${col.bg} ${col.height} rounded-t-lg transition-all duration-1000`}></div>
                    <span className="text-[10px] text-muted mt-1">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-text">Sourcing Funnel Yield</h3>
              <div className="space-y-4">
                {[
                  { title: "Active Applications Vetted", yield: "92%", status: "OPTIMIZED", color: "text-success" },
                  { title: "Average Score Match Ratio", yield: "78%", status: "STABLE", color: "text-primary" },
                  { title: "Avg. Hiring Timeline Yield", yield: "18 Days", status: "FAST", color: "text-info" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-bg/40 rounded-xl border border-border/30">
                    <div>
                      <span className="text-xs text-muted uppercase font-bold tracking-wider">{item.status}</span>
                      <h4 className="text-sm font-semibold text-text mt-0.5">{item.title}</h4>
                    </div>
                    <span className={`text-xl font-extrabold ${item.color}`}>{item.yield}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: 5. COMPANY PROFILE */}
        {activeSection === "profile" && (
          <div className="bg-surface border border-border/60 rounded-2xl p-8 max-w-3xl space-y-6 text-left">
            <h3 className="text-lg font-bold text-text border-b border-border/40 pb-4 flex items-center gap-2">
              <Building2 className="text-primary" /> Edit Organization Profile
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Part 1: General Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider border-l-2 border-primary pl-2">General Information</h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile?.name || ""}
                    onChange={handleProfileChange}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={profile?.industry || ""}
                      onChange={handleProfileChange}
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Website URL</label>
                    <input
                      type="url"
                      name="website"
                      value={profile?.website || ""}
                      onChange={handleProfileChange}
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Size</label>
                    <select
                      name="company_size"
                      value={profile?.company_size || "11-50"}
                      onChange={handleProfileChange}
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-1000">201-1000 Employees</option>
                      <option value="1000+">1000+ Employees</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Headquarters City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile?.city || ""}
                      onChange={handleProfileChange}
                      placeholder="e.g. Mumbai"
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Founded Year</label>
                    <input
                      type="number"
                      name="year_established"
                      value={profile?.year_established || 2020}
                      onChange={handleProfileChange}
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: HR Contact Info */}
              <div className="space-y-4 border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider border-l-2 border-primary pl-2">Primary HR Contact Point</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Contact Person Name</label>
                    <input
                      type="text"
                      name="authorized_contact_name"
                      value={profile?.authorized_contact_name || ""}
                      onChange={handleProfileChange}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Designation</label>
                    <input
                      type="text"
                      name="authorized_contact_designation"
                      value={profile?.authorized_contact_designation || ""}
                      onChange={handleProfileChange}
                      placeholder="e.g. Recruiting Coordinator"
                      className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Branding & Assets */}
              <div className="space-y-4 border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider border-l-2 border-primary pl-2">Branding Assets</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {profile?.logo_url ? (
                        <div className="relative size-14 border border-border/60 rounded-xl overflow-hidden bg-bg">
                          <img src={profile.logo_url} alt="Logo" className="size-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setProfile((prev: any) => ({ ...prev, logo_url: "" }))}
                            className="absolute top-0 right-0 bg-error text-white p-0.5 rounded-bl hover:bg-error-dark"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="size-14 bg-bg border-2 border-dashed border-border/85 rounded-xl flex items-center justify-center text-muted">
                          <Building2 size={20} />
                        </div>
                      )}
                      {!profile?.logo_url && (
                        <label className="cursor-pointer text-[10px] font-bold text-primary border border-primary/40 px-3 py-1.5 rounded-xl bg-bg hover:bg-primary/5">
                          Upload Logo
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleProfileFileUpload(e, "logo_url")}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted font-bold block">Cover Banner</label>
                    <div className="flex items-center gap-4">
                      {profile?.cover_image_url ? (
                        <div className="relative w-28 h-14 border border-border/60 rounded-xl overflow-hidden bg-bg">
                          <img src={profile.cover_image_url} alt="Banner" className="size-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setProfile((prev: any) => ({ ...prev, cover_image_url: "" }))}
                            className="absolute top-0 right-0 bg-error text-white p-0.5 rounded-bl hover:bg-error-dark"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-14 bg-bg border-2 border-dashed border-border/85 rounded-xl flex items-center justify-center text-[10px] text-muted font-semibold uppercase">
                          No Banner
                        </div>
                      )}
                      {!profile?.cover_image_url && (
                        <label className="cursor-pointer text-[10px] font-bold text-primary border border-primary/40 px-3 py-1.5 rounded-xl bg-bg hover:bg-primary/5">
                          Upload Banner
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleProfileFileUpload(e, "cover_image_url")}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 4: Profile Descriptions & Culture */}
              <div className="space-y-4 border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider border-l-2 border-primary pl-2">About & Culture</h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">About Company Description</label>
                  <textarea
                    name="description"
                    value={profile?.description || ""}
                    onChange={handleProfileChange}
                    rows={3}
                    className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Culture</label>
                  <textarea
                    name="culture"
                    value={profile?.culture || ""}
                    onChange={handleProfileChange}
                    rows={2}
                    placeholder="e.g. Work-life balance, high trust, remote-first..."
                    className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Perks & Benefits</label>
                  <textarea
                    name="benefits"
                    value={profile?.benefits || ""}
                    onChange={handleProfileChange}
                    rows={2}
                    placeholder="e.g. Free lunch, health insurance, standard learning budget..."
                    className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Part 5: Social Accounts */}
              <div className="space-y-4 border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider border-l-2 border-primary pl-2">Social Accounts</h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">LinkedIn Page URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={profile?.social_links?.linkedin || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
              </div>

              <div className="bg-bg/40 p-4 rounded-xl border border-border/30 text-xs text-muted flex gap-2 items-center">
                <ShieldCheck className="text-success text-success shrink-0" />
                <span>Updating your profile details updates company metadata visible to candidates instantly.</span>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={savingProfile} variant="primary" className="px-6 py-2.5 text-xs font-bold">
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION: 7. VERIFICATION WIZARD */}
        {activeSection === "verification" && (
          <VerificationWizard initialProfile={profile} />
        )}

        {/* SECTION: 6. SETTINGS */}
        {activeSection === "settings" && (
          <div className="bg-surface border border-border/60 rounded-2xl p-8 max-w-3xl space-y-6">
            <h3 className="text-lg font-bold text-text border-b border-border/40 pb-4 flex items-center gap-2">
              <Settings className="text-primary" /> Settings & Team Admin
            </h3>

            <div className="space-y-6">
              {/* Invite teammate */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text uppercase tracking-wider">Invite Teammate</h4>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Teammate email address..."
                    className="flex-1 h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                  <select className="h-11 px-4 bg-bg border border-border/60 rounded-xl text-xs font-bold text-text">
                    <option>Hiring Manager</option>
                    <option>Recruiter Coordinator</option>
                    <option>Company Admin</option>
                  </select>
                  <button
                    onClick={() => toast.success("Teammate invite sent!")}
                    className="px-5 h-11 bg-primary text-white font-bold rounded-xl text-xs hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    Send Invite
                  </button>
                </div>
              </div>

              <hr className="border-border/40" />

              {/* Notification Toggles */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text uppercase tracking-wider">System Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: "New Application Received Alerts", desc: "Notify recruiter instantly when a high candidate fit is matched." },
                    { label: "Interview Response Reminders", desc: "Receive email warnings 24 hours before a mock/live interview session." },
                    { label: "Weekly Talent pipeline digests", desc: "Send summary metrics of sourced developers to organizational stakeholders." }
                  ].map((toggle, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-primary" />
                      <div>
                        <span className="text-xs font-bold block text-text group-hover:text-primary transition-colors">{toggle.label}</span>
                        <span className="text-[10px] text-muted block mt-0.5">{toggle.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. After Publish Success Screen */}
        {wizardSuccess && successJobId && (
          <div className="max-w-2xl mx-auto bg-surface border border-border/60 rounded-3xl p-8 text-center space-y-8 shadow-lg">
            <div className="space-y-3">
              <div className="justify-center size-20 bg-success-bg text-success rounded-full flex items-center mx-auto shadow-inner shadow-success/15">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-text">Requisition Published Successfully!</h2>
              <p className="text-sm text-muted max-w-md mx-auto">
                Your job listing is now live in our taxonomy search database. Candidate skill matching indices are calculating in real time.
              </p>
            </div>

            {/* Requisition Link Card */}
            <div className="bg-bg/40 border border-border/30 rounded-2xl p-4 flex justify-between items-center max-w-md mx-auto">
              <span className="text-xs text-muted truncate pr-4 text-left">
                {typeof window !== "undefined" ? `${window.location.origin}/jobs/${successJobId}` : `/jobs/${successJobId}`}
              </span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/jobs/${successJobId}`);
                    toast.success("Job URL copied to clipboard!");
                  }
                }}
                className="p-2.5 hover:bg-border/30 rounded-xl text-primary flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
                title="Copy Link"
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>

            <div className="flex gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  setWizardSuccess(false);
                  setActiveSection("jobs");
                }}
                className="flex-1 h-11 border border-border/60 hover:bg-bg rounded-xl text-xs font-bold text-text transition-colors cursor-pointer"
              >
                View Jobs Hub
              </button>
              <button
                onClick={() => router.push(`/jobs/${successJobId}`)}
                className="flex-1 h-11 bg-primary text-white font-bold rounded-xl text-xs hover:scale-[1.02] transition-transform cursor-pointer"
              >
                View Live Job
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 4. Create Job Wizard (Interactive Steps Dialog Modal) */}
      <Dialog
        isOpen={showWizard}
        onClose={() => {
          if (confirm("Cancel requisition? Unsaved inputs will be lost.")) {
            setShowWizard(false);
          }
        }}
        title={editingJobId ? "Edit Job Requisition" : "Create Job Requisition"}
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full pt-4 border-t border-border/40">
            <div>
              {wizardStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="gap-1.5 flex items-center min-h-[44px] px-5 rounded-xl text-xs font-bold"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleWizardSubmit("DRAFT")}
                className="min-h-[44px] px-5 rounded-xl text-xs font-bold"
              >
                Save Draft
              </Button>

              {wizardStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    // Quick step validation
                    if (wizardStep === 1 && !jobForm.title) {
                      toast.error("Please enter a Job Title");
                      return;
                    }
                    if (wizardStep === 2 && (!jobForm.salaryMin || !jobForm.salaryMax)) {
                      toast.error("Please specify a Salary Range");
                      return;
                    }
                    setWizardStep(prev => prev + 1);
                  }}
                  className="min-h-[44px] px-5 rounded-xl text-xs font-bold"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleWizardSubmit("OPEN")}
                  className="min-h-[44px] px-6 rounded-xl text-xs font-bold bg-success hover:bg-success/90 border-none"
                >
                  Publish Job
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/40">
          {[
            { step: 1, label: "Info" },
            { step: 2, label: "Prereqs" },
            { step: 3, label: "Details" },
            { step: 4, label: "Settings" },
            { step: 5, label: "Preview" }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className={`size-8 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                wizardStep === item.step
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : wizardStep > item.step
                    ? "bg-success-bg text-success border border-success/30"
                    : "bg-bg text-muted border border-border/60"
              }`}>
                {wizardStep > item.step ? "✓" : item.step}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest hidden sm:inline-block ${
                wizardStep === item.step ? "text-primary" : "text-muted"
              }`}>
                {item.label}
              </span>
              {item.step < 5 && <ChevronRight size={14} className="text-muted/40 hidden sm:inline-block" />}
            </div>
          ))}
        </div>

        {/* Wizard step form rendering */}
        <div className="min-h-[350px] text-left">
          
          {/* STEP 1: Basic Information */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Job Title <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Lead Full-Stack Engineer (React / Python)"
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Department</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Employment Type</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Location (HQ / City)</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA / Remote"
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Work Mode</label>
                  <div className="flex gap-2 p-1 bg-bg border border-border/60 rounded-xl">
                    {(["Remote", "Hybrid", "Onsite"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setJobForm({ ...jobForm, workMode: mode })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          jobForm.workMode === mode
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover:text-text"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Requirements */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Skills Required</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jobForm.newSkillInput}
                    onChange={(e) => setJobForm({ ...jobForm, newSkillInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkillTag();
                      }
                    }}
                    placeholder="Type skill tag (e.g. Python) and press Enter or Add..."
                    className="flex-1 h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                  <button
                    type="button"
                    onClick={addSkillTag}
                    className="px-4 bg-bg border border-border/60 hover:bg-border/30 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                
                {/* Skill tag list rendering */}
                <div className="flex flex-wrap gap-1.5 mt-2 font-semibold">
                  {jobForm.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg text-xs font-bold">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillTag(skill)}
                        className="text-primary hover:text-red-500 font-bold ml-1 text-xs shrink-0 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {jobForm.skills.length === 0 && (
                    <span className="text-xs text-muted italic font-medium">No skill tags added yet. Added tags appear here.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted font-bold">
                    <label htmlFor="wizard-exp-slider" className="uppercase">Experience Needed</label>
                    <span className="text-primary">{jobForm.experience} Years+</span>
                  </div>
                  <input
                    id="wizard-exp-slider"
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-primary mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>Entry level (0 yrs)</span>
                    <span>15+ yrs</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Notice Period</label>
                  <select
                    value={jobForm.noticePeriod}
                    onChange={(e) => setJobForm({ ...jobForm, noticePeriod: e.target.value })}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option>Immediate</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Min Salary <span className="text-error">*</span></label>
                  <input
                    type="number"
                    required
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                    placeholder="e.g. 110000"
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Max Salary <span className="text-error">*</span></label>
                  <input
                    type="number"
                    required
                    value={jobForm.salaryMax}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                    placeholder="e.g. 140000"
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Currency</label>
                  <select
                    value={jobForm.currency}
                    onChange={(e) => setJobForm({ ...jobForm, currency: e.target.value })}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Description Details */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-bg/40 p-4 rounded-xl border border-border/30 text-xs text-muted flex gap-2">
                <FileText className="text-primary shrink-0" size={16} />
                <span>Fill the core description sections. They will render automatically as clean JDs for candidates.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">About Company Description</label>
                  <textarea
                    rows={4}
                    value={jobForm.aboutCompany}
                    onChange={(e) => setJobForm({ ...jobForm, aboutCompany: e.target.value })}
                    placeholder="Enter short details of culture, product, stack..."
                    className="w-full p-3 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Job Responsibilities</label>
                  <textarea
                    rows={4}
                    value={jobForm.responsibilities}
                    onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                    placeholder="e.g. - Architect and deliver highly scalable UI components..."
                    className="w-full p-3 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Requirements & Prerequisites</label>
                  <textarea
                    rows={4}
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    placeholder="e.g. - 3+ years experience with React/Next.js..."
                    className="w-full p-3 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Benefits & Offers</label>
                  <textarea
                    rows={4}
                    value={jobForm.benefits}
                    onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                    placeholder="e.g. - Unlimited PTO, premium health insurance, remote stipend..."
                    className="w-full p-3 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Application Settings */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Application Deadline</label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    style={{ colorScheme: "dark" }}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Number of Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.openings}
                    onChange={(e) => setJobForm({ ...jobForm, openings: Number(e.target.value) })}
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
              </div>

              <hr className="border-border/40 mt-4" />

              <div className="space-y-4 pt-2">
                <h4 className="text-xs uppercase tracking-wider text-muted font-bold block">Application Constraints</h4>
                
                <div className="space-y-3.5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={jobForm.resumeRequired}
                      onChange={(e) => setJobForm({ ...jobForm, resumeRequired: e.target.checked })}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold block text-text group-hover:text-primary transition-colors">Candidate Resume Required</span>
                      <span className="text-[10px] text-muted block mt-0.5">Force candidate uploads before letting them apply.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={jobForm.coverLetterOptional}
                      onChange={(e) => setJobForm({ ...jobForm, coverLetterOptional: e.target.checked })}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold block text-text group-hover:text-primary transition-colors">Cover Letter Optional</span>
                      <span className="text-[10px] text-muted block mt-0.5">Let candidates provide brief notes in their submit form.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={jobForm.autoClose}
                      onChange={(e) => setJobForm({ ...jobForm, autoClose: e.target.checked })}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold block text-text group-hover:text-primary transition-colors">Auto Close Position</span>
                      <span className="text-[10px] text-muted block mt-0.5">Automatically close listings when target opening limit is reached.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: High-fidelity Candidate Preview */}
          {wizardStep === 5 && (
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 border border-border/40 p-4 rounded-2xl bg-bg/25 text-left animate-in fade-in duration-300">
              <div className="flex items-start gap-4 pb-4 border-b border-border/40">
                <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <BriefcaseBusiness size={28} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-xl font-extrabold text-text leading-snug">{jobForm.title || "Job Title"}</h3>
                  <div className="flex gap-2.5 items-center text-xs text-muted flex-wrap font-medium">
                    <span>{profile?.name || "Your Company Name"}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {jobForm.location} ({jobForm.workMode})</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {jobForm.employmentType}</span>
                  </div>
                </div>
              </div>

              {/* Salary Bracket Banner */}
              <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl flex justify-between items-center">
                <div className="text-left">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Candidate Match Score</span>
                  <span className="text-xs text-primary font-semibold mt-0.5 block">Estimated Fit Analysis Vetted</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Expected Salary</span>
                  <span className="text-sm text-success font-bold block mt-0.5">
                    {jobForm.salaryMin ? `${jobForm.currency} ${Number(jobForm.salaryMin).toLocaleString()} - ${Number(jobForm.salaryMax).toLocaleString()}` : "Negotiable"}
                  </span>
                </div>
              </div>

              {/* JDs Sections */}
              <div className="space-y-5 text-sm leading-relaxed font-medium">
                {jobForm.aboutCompany && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider text-muted font-bold">About Company</h4>
                    <p className="text-text/90 whitespace-pre-line text-xs">{jobForm.aboutCompany}</p>
                  </div>
                )}
                
                {jobForm.responsibilities && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider text-muted font-bold">Responsibilities</h4>
                    <p className="text-text/90 whitespace-pre-line text-xs">{jobForm.responsibilities}</p>
                  </div>
                )}

                {jobForm.requirements && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider text-muted font-bold">Prerequisites & Requirements</h4>
                    <p className="text-text/90 whitespace-pre-line text-xs">{jobForm.requirements}</p>
                  </div>
                )}

                {jobForm.benefits && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider text-muted font-bold">Benefits & Offers</h4>
                    <p className="text-text/90 whitespace-pre-line text-xs">{jobForm.benefits}</p>
                  </div>
                )}
              </div>

              {/* Skills required tags */}
              {jobForm.skills.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40 font-semibold">
                  <h4 className="text-xs uppercase tracking-wider text-muted font-bold font-sans">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jobForm.skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-bg border border-border/30 text-xs font-semibold text-muted rounded-lg uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </Dialog>

    </div>
  );
}
