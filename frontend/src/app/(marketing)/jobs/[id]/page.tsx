"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  getJobDetailAction, 
  getCandidateProfileAction, 
  getApplicationsAction,
  applyToJobAction,
  saveJobAction,
  unsaveJobAction,
  updateCandidateProfileAction
} from "@/features/auth/actions";
import { 
  Button, 
  Breadcrumbs, 
  LoadingState, 
  toast,
  SignUpModal
} from "@/shared/ui";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  PlusCircle, 
  BadgeCheck, 
  ClipboardCheck, 
  Bookmark, 
  BookmarkPlus, 
  Rocket,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness
} from "lucide-react";
import { extractJobId } from "@/shared/utils/slug";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const jobId = React.useMemo(() => extractJobId(rawId), [rawId]);

  const [job, setJob] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpActionText, setSignUpActionText] = useState("");

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobData, profileData, appListData] = await Promise.all([
          getJobDetailAction(jobId),
          getCandidateProfileAction(),
          getApplicationsAction()
        ]);

        if (jobData && !jobData.error) {
          setJob(jobData);
        } else {
          toast.error("Failed to load job details");
        }

        if (profileData && !profileData.error) {
          setProfile(profileData);
        }

        if (appListData && !appListData.error && Array.isArray(appListData)) {
          const app = appListData.find((a: any) => a.job === jobId);
          if (app) setApplication(app);
        }
      } catch {
        // No console.error in production (Issue #11)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // Set document title dynamically for SEO optimization
  useEffect(() => {
    if (job) {
      document.title = `${job.title} at ${job.company_name} | JobLyne`;
    }
  }, [job]);

  // Skills match analysis calculation
  const skillAnalysis = useMemo(() => {
    if (!job) return { matching: [], missing: [], percentage: 0 };
    const jobSkills = job.skills || [];
    const candidateSkills = new Set(
      (profile?.skills || []).map((s: string) => s.toLowerCase())
    );

    const matching = jobSkills.filter((s: string) => candidateSkills.has(s.toLowerCase()));
    const missing = jobSkills.filter((s: string) => !candidateSkills.has(s.toLowerCase()));

    const percentage =
      jobSkills.length > 0 ? Math.round((matching.length / jobSkills.length) * 100) : 60;

    return { matching, missing, percentage };
  }, [job, profile]);

  const matchVal = job?.match_score ?? skillAnalysis.percentage;

  const handleApply = async () => {
    if (!profile) {
      setSignUpActionText("to apply for this job opportunity");
      setIsSignUpModalOpen(true);
      return;
    }
    setApplying(true);
    try {
      const res = await applyToJobAction(jobId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Application submitted successfully!");
        setJob((prev: any) => prev ? { ...prev, has_applied: true } : null);
        
        // Load the updated applications list to populate applied info card
        const appListData = await getApplicationsAction();
        if (appListData && !appListData.error && Array.isArray(appListData)) {
          const app = appListData.find((a: any) => a.job === jobId);
          if (app) setApplication(app);
        }
      }
    } catch {
      toast.error("Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!profile) {
      setSignUpActionText("to bookmark this job opportunity");
      setIsSignUpModalOpen(true);
      return;
    }
    setSaving(true);
    try {
      if (job.is_saved) {
        const res = await unsaveJobAction(job.id);
        if (!res.error) {
          toast.success("Removed from saved list");
          setJob((prev: any) => prev ? { ...prev, is_saved: false } : null);
        }
      } else {
        const res = await saveJobAction(job.id);
        if (!res.error) {
          toast.success("Opportunity bookmarked!");
          setJob((prev: any) => prev ? { ...prev, is_saved: true } : null);
        }
      }
    } catch {
      toast.error("Failed to update saved status");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillName: string) => {
    if (!profile) {
      setSignUpActionText("to update your skill profiles");
      setIsSignUpModalOpen(true);
      return;
    }
    setUpdatingSkill(skillName);
    
    const currentSkills = profile.skills || [];
    const updatedSkills = [...new Set([...currentSkills, skillName])];
    
    try {
      const res = await updateCandidateProfileAction({ skills: updatedSkills });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`"${skillName}" successfully added to your profile!`);
        setProfile((prev: any) => ({ ...prev, skills: updatedSkills }));
      }
    } catch {
      toast.error("Failed to add skill");
    } finally {
      setUpdatingSkill(null);
    }
  };

  const getStatusClass = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s === "PENDING") return "text-info bg-info-bg border-info/20";
    if (s === "INTERVIEW") return "text-warning bg-warning-bg border-warning/20";
    if (s === "OFFER") return "text-success bg-success-bg border-success/20";
    if (s === "REJECTED" || s === "DECLINED") return "text-error bg-error-bg border-error/20";
    return "text-muted bg-bg border-border/40";
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-6 flex-col">
        <LoadingState variant="card" rows={4} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle size={48} className="text-error mb-4" />
        <h2 className="type-h2 mb-2">Job Listing Not Found</h2>
        <p className="text-muted mb-6">This job listing may have been closed or removed by the hiring coordinator.</p>
        <Button as={Link} href="/jobs" variant="primary">
          Browse Active Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full text-text max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 flex-col">
      {/* Dynamic SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description || job.requirements || `${job.title} job opportunity at ${job.company_name}.`,
            "datePosted": job.created_at || new Date().toISOString(),
            "employmentType": job.employment_type === "Full-time" ? "FULL_TIME" : job.employment_type === "Part-time" ? "PART_TIME" : job.employment_type === "Contract" ? "CONTRACT" : "OTHER",
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company_name,
              "logo": job.company_logo || undefined
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location || "Remote",
                "addressCountry": "US"
              }
            },
            "baseSalary": job.salary_min ? {
              "@type": "MonetaryAmount",
              "currency": job.currency || "USD",
              "value": {
                "@type": "QuantitativeValue",
                "minValue": Number(job.salary_min),
                "maxValue": Number(job.salary_max || job.salary_min),
                "unitText": "YEAR"
              }
            } : undefined
          })
        }}
      />

      {/* Interceptor Signup Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        actionText={signUpActionText}
      />

      {/* Back & Navigation Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.back()}
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1.5 px-3 min-h-[36px] text-muted hover:text-text"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Jobs", href: "/jobs" },
              { label: job.title }
            ]}
          />
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="border-border rounded-2xl bg-surface p-6 sm:p-8 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="border-border/40 justify-center shrink-0 h-16 w-16 items-center p-3 bg-bg flex rounded-2xl border">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Briefcase className="text-primary" size={32} aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text leading-tight">{job.title}</h1>
            <p className="text-base text-muted font-medium flex items-center gap-2 flex-wrap">
              <span>{job.company_name}</span>
              <span className="text-border">&bull;</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
              <span className="text-border">&bull;</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {job.employment_type}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className={`min-h-[48px] gap-2 px-5 items-center justify-center transition-all py-3 flex type-caption rounded-xl border cursor-pointer font-semibold shrink-0 ${
              job.is_saved
                ? "text-primary border-primary bg-primary/10"
                : "text-muted border-border/60 hover:bg-bg"
            }`}
          >
            {job.is_saved ? (
              <Bookmark className="text-primary fill-primary" size={18} aria-hidden="true" />
            ) : (
              <BookmarkPlus size={18} aria-hidden="true" />
            )}
            {job.is_saved ? "Bookmarked" : "Save Job"}
          </button>

          {job.has_applied ? (
            <button
              disabled
              className="border-success/30 px-8 min-h-[48px] gap-2 text-success items-center justify-center bg-success-bg py-3 type-ui flex rounded-xl border font-semibold select-none cursor-default"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              Applied
            </button>
          ) : (
            <Button
              onClick={handleApply}
              disabled={applying}
              variant="primary"
              className="relative justify-center px-8 min-h-[48px] gap-2 items-center py-3"
            >
              {applying && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 border-2 rounded-full h-4 border-t-transparent w-4 animate-spin border-white"></span>
              )}
              <Rocket size={18} aria-hidden="true" />
              Apply to opportunity
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Details Section */}
      <div className="w-full gap-8 items-start grid grid-cols-1 lg:grid-cols-3">
        
        {/* Left Side: Job details & Skills match */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Match Score Banner */}
          <div className="rounded-2xl border-primary/20 items-center bg-primary/5 flex-col p-6 justify-between flex gap-6 border sm:flex-row shadow-sm">
            <div className="gap-4 flex items-center">
              <div className="justify-center shrink-0 h-20 relative items-center flex w-20">
                <svg className="w-full transform h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-border/10 fill-none" strokeWidth="6" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="transition-all stroke-primary duration-1000 fill-none"
                    strokeWidth="6"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * matchVal) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-primary type-card-title absolute font-bold text-lg">
                  {matchVal}%
                </span>
              </div>
              <div className="text-left">
                <h4 className="text-text gap-1 items-center text-base flex font-semibold">
                  AI Career Fit Score
                </h4>
                <p className="type-caption text-muted mt-0.5 max-w-sm">
                  Evaluated by comparing your candidate profile against matching requirements in real time.
                </p>
              </div>
            </div>

            <div className="flex text-right items-end flex-col sm:items-end">
              <span className="type-badge text-muted text-xs uppercase tracking-wider font-bold">Salary Bracket</span>
              <span className="text-success mt-1 type-h3 font-semibold">
                {job.salary_min
                  ? `${job.currency}${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}`
                  : "Not Disclosed"}
              </span>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="border-border bg-surface p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4 text-left">
            <h3 className="uppercase text-sm tracking-wider font-bold text-muted flex items-center gap-2">
              <FileText size={18} />
              Role Description
            </h3>
            <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line">
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Required Skills breakdown */}
          <div className="border-border bg-surface p-6 sm:p-8 rounded-2xl border shadow-sm space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="uppercase text-sm tracking-wider font-bold text-muted flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                Requested Qualifications
              </h3>
              <span className="type-caption text-muted text-xs font-semibold">
                {skillAnalysis.matching.length} of {job.skills?.length || 0} matching
              </span>
            </div>

            <div className="gap-4 flex flex-col">
              {/* Match section */}
              {skillAnalysis.matching.length > 0 && (
                <div className="border-success/20 gap-2 flex-col flex bg-success-bg p-4 rounded-xl border">
                  <div className="type-badge text-success uppercase items-center gap-2 tracking-wider flex font-semibold text-xs">
                    <CheckCircle2 size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Satisfied Prerequisites
                  </div>
                  <div className="gap-2 flex mt-1 flex-wrap">
                    {skillAnalysis.matching.map((skill: string) => (
                      <span
                        key={skill}
                        className="py-1 gap-1.5 text-success border-success/20 items-center rounded-lg px-2.5 bg-success-bg flex type-caption border text-xs"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {skillAnalysis.missing.length > 0 ? (
                <div className="gap-2 flex-col border-warning/20 flex p-4 bg-warning-bg rounded-xl border">
                  <div className="type-badge uppercase text-warning items-center gap-2 tracking-wider flex font-semibold text-xs">
                    <Zap size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Missing Credentials to Add
                  </div>
                  <p className="type-caption text-muted text-xs">
                    Add these missing elements to your candidate profile to match the employer's expectations.
                  </p>

                  <div className="gap-2 flex mt-1 flex-wrap">
                    {skillAnalysis.missing.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        disabled={updatingSkill !== null}
                        className="py-1 cursor-pointer gap-1.5 border-warning/30 text-warning items-center transition-all rounded-lg px-2.5 bg-warning-bg min-h-[36px] flex type-caption border text-xs hover:opacity-90"
                      >
                        {updatingSkill === skill ? (
                          <span className="h-3 mr-1 border-2 inline-block w-3 border-warning rounded-full border-t-transparent animate-spin"></span>
                        ) : (
                          <PlusCircle size={14} aria-hidden="true" />
                        )}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="justify-center border-success/20 text-success items-center gap-2 text-center flex bg-success-bg p-4 type-caption rounded-xl border text-xs">
                  <BadgeCheck size={16} aria-hidden="true" />
                  <span>Verified: Your profile meets 100% of the requested skill constraints.</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Requirements prerequisites */}
          {job.requirements && (
            <div className="border-border bg-surface p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4 text-left">
              <h3 className="uppercase text-sm tracking-wider font-bold text-muted flex items-center gap-2">
                <ClipboardCheck size={18} />
                Prerequisites & Requirements
              </h3>
              <p className="text-text/80 text-sm leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          )}

        </div>

        {/* Right Side Sticky: Application Status & Filled Details */}
        <div className="space-y-6 lg:sticky lg:top-[calc(var(--height-header)+16px)]">
          {application ? (
            /* Filled Application Details Card */
            <div className="border-border bg-surface p-6 rounded-2xl border shadow-sm text-left space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="type-card-title font-semibold text-text mb-2">Application Tracking</h3>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`py-1 text-[11px] font-bold uppercase tracking-wider px-3 rounded-full border ${getStatusClass(application.status)}`}>
                    {application.status}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Calendar size={14} />
                    Applied {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Submitted Details */}
              <div className="space-y-4">
                <h4 className="type-ui font-semibold text-text text-sm">Submitted Details:</h4>
                
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="justify-center h-8 w-8 text-primary shrink-0 items-center bg-primary/5 flex rounded-lg">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Full Name</p>
                      <p className="text-sm font-medium text-text truncate">{application.candidate_name || profile?.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="justify-center h-8 w-8 text-primary shrink-0 items-center bg-primary/5 flex rounded-lg">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Email Address</p>
                      <p className="text-sm font-medium text-text truncate">{application.candidate_email || profile?.email}</p>
                    </div>
                  </div>

                  { (application.candidate_phone || profile?.phone) && (
                    <div className="flex items-center gap-3">
                      <div className="justify-center h-8 w-8 text-primary shrink-0 items-center bg-primary/5 flex rounded-lg">
                        <Phone size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Phone Number</p>
                        <p className="text-sm font-medium text-text truncate">{application.candidate_phone || profile?.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="justify-center h-8 w-8 text-primary shrink-0 items-center bg-primary/5 flex rounded-lg">
                      <BriefcaseBusiness size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Work Experience</p>
                      <p className="text-sm font-medium text-text truncate">
                        {application.candidate_experience != null 
                          ? `${application.candidate_experience} Years`
                          : `${profile?.experience_years ?? 0} Years`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter Block */}
              {application.cover_letter && (
                <div className="border-t border-border/40 pt-4 space-y-2">
                  <h4 className="type-ui font-semibold text-text text-sm">Cover Letter Summary:</h4>
                  <p className="text-xs text-muted leading-relaxed italic bg-bg/40 p-3 rounded-lg border border-border/35 max-h-32 overflow-y-auto">
                    &ldquo;{application.cover_letter}&rdquo;
                  </p>
                </div>
              )}

              {/* Action Details info */}
              {application.interview_schedule && (
                <div className="border-t border-border/40 pt-4 space-y-2">
                  <h4 className="type-ui font-semibold text-warning text-sm flex items-center gap-1.5">
                    <Calendar size={16} />
                    Interview Invitation
                  </h4>
                  <p className="text-xs text-text/95">
                    An interview is scheduled for this opportunity on:
                    <strong className="block mt-1 font-semibold text-text">
                      {new Date(application.interview_schedule).toLocaleString()}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Sidebar Sizing Sourcing info / CTA when not applied */
            <div className="border-border bg-surface p-6 rounded-2xl border shadow-sm text-left space-y-5">
              <h3 className="type-card-title font-semibold text-text">Sourcing Status</h3>
              
              <div className="space-y-3.5 text-sm text-muted">
                <p>This recruiter requisition accepts talent applications directly on JobLyne.</p>
                <div className="h-px bg-border/40 w-full"></div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-text">How it works:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Submit your profile with one click.</li>
                    <li>Employers match your details instantly.</li>
                    <li>Saves are preserved in your bookmarks.</li>
                  </ul>
                </div>
              </div>

              {job.has_applied ? (
                <button
                  disabled
                  className="w-full min-h-[48px] gap-2 text-success items-center justify-center bg-success-bg py-3 type-ui flex rounded-xl border border-success/30 font-semibold"
                >
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Applied to Sourcing
                </button>
              ) : (
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  variant="primary"
                  className="w-full relative justify-center min-h-[48px] gap-2 items-center py-3"
                >
                  {applying && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 border-2 rounded-full h-4 border-t-transparent w-4 animate-spin border-white"></span>
                  )}
                  <Rocket size={18} aria-hidden="true" />
                  Apply now
                </Button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
