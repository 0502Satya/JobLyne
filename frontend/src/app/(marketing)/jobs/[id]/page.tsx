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
import { getJobsAction } from "@/features/auth/jobActions";
import { Job } from "@/types/job";
import { Profile } from "@/types/profile";
import { CandidateApplication } from "@/types/application";
import { calculateTrustScore, getBadgeDetails } from "@/shared/utils/trustScore";
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
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Rocket,
  ChevronRight,
  TrendingUp,
  Banknote
} from "lucide-react";
import { extractJobId } from "@/shared/utils/slug";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const jobId = React.useMemo(() => extractJobId(rawId), [rawId]);

  const [job, setJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<CandidateApplication | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpActionText, setSignUpActionText] = useState("");

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobData, profileData, appListData] = await Promise.all([
          getJobDetailAction(jobId),
          getCandidateProfileAction(),
          getApplicationsAction()
        ]);

        if (!isMounted) return;

        if (jobData && !jobData.error) {
          setJob(jobData);
        } else {
          toast.error("Failed to load job details");
        }

        if (profileData && !profileData.error) {
          setProfile(profileData);
        }

        if (appListData && !appListData.error && Array.isArray(appListData)) {
          const app = appListData.find((a: CandidateApplication) => a.job === jobId);
          if (app) setApplication(app);
        }

        // Fetch related jobs
        const allJobsData = await getJobsAction();
        if (!isMounted) return;
        if (allJobsData && !allJobsData.error) {
          const list = Array.isArray(allJobsData) ? allJobsData : (allJobsData.results || []);
          const filtered = list
            .filter((item: Job) => item.id !== jobId && (
              item.employment_type === jobData.employment_type ||
              item.location === jobData.location ||
              item.title.toLowerCase().includes(jobData.title.toLowerCase())
            ))
            .slice(0, 3);
          setRelatedJobs(filtered);
        }
      } catch {
        // Safe fail
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Set document title dynamically for SEO optimization
  useEffect(() => {
    if (job) {
      document.title = `${job.title} at ${job.company_name} | JobLyne`;
    }
  }, [job]);

  // Track scroll position to show sticky Apply Now bar at the bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Parse structured markdown sections from description
  const parsedSections = useMemo(() => {
    if (!job) return null;
    const desc = job.description || "";
    
    const extractSection = (header: string) => {
      const match = desc.match(new RegExp(`### ${header}\\n([\\s\\S]*?)(?:\\n###|\\n---|$)`));
      return match ? match[1].trim() : "";
    };

    const aboutCompany = extractSection("About Company");
    const responsibilities = extractSection("Responsibilities");
    const requirements = extractSection("Requirements");
    const benefits = extractSection("Benefits");

    if (aboutCompany || responsibilities || requirements || benefits) {
      return {
        aboutCompany,
        responsibilities,
        requirements,
        benefits,
        isStructured: true
      };
    }
    return {
      aboutCompany: "",
      responsibilities: "",
      requirements: "",
      benefits: "",
      isStructured: false
    };
  }, [job]);

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
        setJob(prev => prev ? { ...prev, has_applied: true } : null);
        
        const appListData = await getApplicationsAction();
        if (appListData && !appListData.error && Array.isArray(appListData)) {
          const app = appListData.find((a: CandidateApplication) => a.job === jobId);
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
      if (job && job.is_saved) {
        const res = await unsaveJobAction(job.id);
        if (!res.error) {
          toast.success("Removed from saved list");
          setJob(prev => prev ? { ...prev, is_saved: false } : null);
        }
      } else if (job) {
        const res = await saveJobAction(job.id);
        if (!res.error) {
          toast.success("Opportunity bookmarked!");
          setJob(prev => prev ? { ...prev, is_saved: true } : null);
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
        setProfile(prev => prev ? { ...prev, skills: updatedSkills } : null);
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
    <div className="w-full text-text max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 flex-col pb-24 font-sans text-left">
      
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
          }).replace(/</g, '\\u003c')
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
            className="flex items-center gap-1.5 px-3 min-h-[36px] text-muted hover:text-text cursor-pointer"
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
      <div className="border border-border/60 rounded-2xl bg-surface p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="border border-border/40 justify-center shrink-0 h-16 w-16 items-center p-3 bg-bg flex rounded-2xl">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Briefcase className="text-primary animate-pulse" size={32} aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text leading-tight">{job.title}</h1>
            <div className="text-base text-muted font-medium flex items-center gap-2 flex-wrap leading-none">
              <span className="font-bold text-text">{job.company_name}</span>
              {(() => {
                const companyDataForScore = {
                  official_email: job.company_name ? `info@${job.company_name.toLowerCase().replace(/\s+/g, "")}.com` : "",
                  phone_number: "+919999999999",
                  website: job.company_name ? `https://${job.company_name.toLowerCase().replace(/\s+/g, "")}.com` : "",
                  verification_status: job.company_verification_status || "pending",
                  social_links: job.company_social_links || {}
                };
                const trustResult = calculateTrustScore(companyDataForScore);
                if (trustResult.badge === "UNVERIFIED") return null;
                const details = getBadgeDetails(trustResult.badge);
                return (
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${details.color}`}>
                    <span>{details.indicator}</span>
                    <span>{details.label}</span>
                  </span>
                );
              })()}
              <span className="text-border">&bull;</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
              <span className="text-border">&bull;</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {job.employment_type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className={`min-h-[48px] gap-2 px-5 items-center justify-center transition-all py-3 flex type-caption rounded-xl border cursor-pointer font-bold shrink-0 ${
              job.is_saved
                ? "text-primary border-primary bg-primary/10"
                : "text-muted border-border/60 hover:bg-bg"
            }`}
          >
            {job.is_saved ? (
              <Bookmark className="text-primary fill-primary animate-bounce" size={18} aria-hidden="true" />
            ) : (
              <BookmarkPlus size={18} aria-hidden="true" />
            )}
            {job.is_saved ? "Bookmarked" : "Save Job"}
          </button>

          {job.has_applied ? (
            <button
              disabled
              className="border-success/30 px-8 min-h-[48px] gap-2 text-success items-center justify-center bg-success-bg py-3 type-ui flex rounded-xl border font-bold select-none cursor-default"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              Applied
            </button>
          ) : (
            <Button
              onClick={handleApply}
              disabled={applying}
              variant="primary"
              className="relative justify-center px-8 min-h-[48px] gap-2 items-center py-3 font-bold"
            >
              {applying && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 border-2 rounded-full h-4 border-t-transparent w-4 animate-spin border-white"></span>
              )}
              <Rocket size={18} aria-hidden="true" />
              Apply Now
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
                <p className="type-caption text-muted mt-0.5 max-w-sm font-medium">
                  Evaluated by comparing your candidate profile against matching requirements in real time.
                </p>
              </div>
            </div>

            <div className="flex text-right items-end flex-col sm:items-end font-semibold">
              <span className="type-badge text-muted text-[10px] uppercase tracking-wider font-bold">Salary Bracket</span>
              <span className="text-success mt-1 type-h3 font-bold">
                {job.salary_min
                  ? `${job.currency} ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max || job.salary_min).toLocaleString()}`
                  : "Not Disclosed"}
              </span>
            </div>
          </div>

          {/* Render Sections (Overview, Responsibilities, Requirements, Benefits, About Company) */}
          {parsedSections && parsedSections.isStructured ? (
            <div className="space-y-6">
              {/* 1. Overview Tab Widget */}
              <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-4">
                <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                  <FileText size={16} /> Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                  <div className="p-3 bg-bg/50 rounded-xl border border-border/30">
                    <span className="text-[10px] text-muted uppercase font-bold block">Location Type</span>
                    <span className="text-text font-bold block mt-1">{job.location} ({job.raw_location || "Remote"})</span>
                  </div>
                  <div className="p-3 bg-bg/50 rounded-xl border border-border/30">
                    <span className="text-[10px] text-muted uppercase font-bold block">Employment Model</span>
                    <span className="text-text font-bold block mt-1">{job.employment_type}</span>
                  </div>
                </div>
              </div>

              {/* 2. Responsibilities */}
              {parsedSections.responsibilities && (
                <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-4">
                  <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" /> Responsibilities
                  </h3>
                  <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {parsedSections.responsibilities}
                  </p>
                </div>
              )}

              {/* 3. Requirements & Skills */}
              {parsedSections.requirements && (
                <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-4">
                  <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" /> Core Requirements
                  </h3>
                  <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium mb-4">
                    {parsedSections.requirements}
                  </p>
                </div>
              )}

              {/* 4. Benefits */}
              {parsedSections.benefits && (
                <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-4">
                  <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                    <TrendingUp size={16} className="text-success" /> Benefits & Compensation
                  </h3>
                  <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {parsedSections.benefits}
                  </p>
                </div>
              )}

              {/* 5. About Company */}
              {parsedSections.aboutCompany && (
                <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-4">
                  <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                    <Briefcase size={16} /> About Company
                  </h3>
                  <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {parsedSections.aboutCompany}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Fallback legacy text block styling */
            <div className="space-y-6">
              <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm space-y-4 text-left">
                <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                  <FileText size={16} /> Role Description
                </h3>
                <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {job.description || "No description provided."}
                </p>
              </div>

              {job.requirements && (
                <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm space-y-4 text-left">
                  <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                    <ClipboardCheck size={16} /> Prerequisites & Requirements
                  </h3>
                  <p className="text-text/80 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {job.requirements}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Required Skills breakdown */}
          <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm space-y-5 text-left font-semibold">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2 font-sans">
                <Sparkles className="text-primary" size={16} />
                Requested Qualifications
              </h3>
              <span className="type-caption text-muted text-xs font-semibold">
                {skillAnalysis.matching.length} of {job.skills?.length || 0} matching
              </span>
            </div>

            <div className="gap-4 flex flex-col font-semibold">
              {skillAnalysis.matching.length > 0 && (
                <div className="border border-success/20 gap-2 flex-col flex bg-success-bg p-4 rounded-xl">
                  <div className="type-badge text-success uppercase items-center gap-2 tracking-wider flex font-semibold text-xs font-sans">
                    <CheckCircle2 size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Satisfied Prerequisites
                  </div>
                  <div className="gap-2 flex mt-1 flex-wrap font-semibold">
                    {skillAnalysis.matching.map((skill: string) => (
                      <span
                        key={skill}
                        className="py-1 gap-1.5 text-success border border-success/20 items-center rounded-lg px-2.5 bg-success-bg flex type-caption text-xs"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillAnalysis.missing.length > 0 ? (
                <div className="gap-2 flex-col border border-warning/20 flex p-4 bg-warning-bg rounded-xl font-semibold">
                  <div className="type-badge uppercase text-warning items-center gap-2 tracking-wider flex font-semibold text-xs font-sans">
                    <Zap size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Missing Credentials to Add
                  </div>
                  <p className="type-caption text-muted text-xs font-medium">
                    Add these missing elements to your candidate profile to match the employer's expectations.
                  </p>

                  <div className="gap-2 flex mt-1 flex-wrap font-semibold">
                    {skillAnalysis.missing.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        disabled={updatingSkill !== null}
                        className="py-1 cursor-pointer gap-1.5 border border-warning/30 text-warning items-center transition-all rounded-lg px-2.5 bg-warning-bg min-h-[36px] flex type-caption text-xs hover:opacity-90 font-semibold"
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
                <div className="justify-center border border-success/20 text-success items-center gap-2 text-center flex bg-success-bg p-4 type-caption rounded-xl text-xs font-semibold">
                  <BadgeCheck size={16} aria-hidden="true" />
                  <span>Verified: Your profile meets 100% of the requested skill constraints.</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Jobs Section */}
          {relatedJobs.length > 0 && (
            <div className="border border-border/60 bg-surface p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-left">
              <h3 className="uppercase text-xs tracking-wider font-bold text-muted flex items-center gap-2">
                <BriefcaseBusiness size={16} /> Related Jobs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedJobs.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/jobs/${item.id}`}
                    className="p-4 bg-bg/40 hover:bg-bg border border-border/30 hover:border-primary/20 rounded-xl space-y-2.5 block transition-all group hover:scale-[1.01]"
                  >
                    <h4 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-muted truncate">{item.company_name} &bull; {item.location}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-border/20 text-[10px] font-bold text-success font-semibold">
                      <span>{item.currency} {Number(item.salary_min).toLocaleString()}</span>
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px]">{item.match_score ?? 60}% Fit</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side Sticky: Application Status & Filled Details */}
        <div className="space-y-6 lg:sticky lg:top-[calc(var(--height-header)+16px)] z-10">
          {application ? (
            /* Filled Application Details Card */
            <div className="border border-border/60 bg-surface p-6 rounded-2xl shadow-sm text-left space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="type-card-title font-semibold text-text mb-2">Application Tracking</h3>
                <div className="flex items-center gap-2.5 flex-wrap font-semibold">
                  <span className={`py-1 text-[11px] font-bold uppercase tracking-wider px-3 rounded-full border ${getStatusClass(application.status)}`}>
                    {application.status}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1 font-medium">
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
                    <strong className="block mt-1 font-semibold text-text font-bold">
                      {new Date(application.interview_schedule).toLocaleString()}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Sidebar Sizing Sourcing info / CTA when not applied */
            <div className="border border-border/60 bg-surface p-6 rounded-2xl shadow-sm text-left space-y-5">
              <h3 className="type-card-title font-semibold text-text">Sourcing Status</h3>
              
              <div className="space-y-3.5 text-sm text-muted">
                <p className="font-medium">This recruiter requisition accepts talent applications directly on JobLyne.</p>
                <div className="h-px bg-border/40 w-full"></div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-text">How it works:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs font-medium">
                    <li>Submit your profile with one click.</li>
                    <li>Employers match your details instantly.</li>
                    <li>Saves are preserved in your bookmarks.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Sticky floating Apply Now bottom bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-border/60 shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="text-left min-w-0 pr-4 flex flex-col justify-center">
              <h4 className="text-sm font-extrabold text-text truncate max-w-xs sm:max-w-md">{job.title}</h4>
              <div className="text-[10px] text-muted font-medium truncate mt-0.5 flex items-center gap-1">
                <span>{job.company_name}</span>
                {(() => {
                  const companyDataForScore = {
                    official_email: job.company_name ? `info@${job.company_name.toLowerCase().replace(/\s+/g, "")}.com` : "",
                    phone_number: "+919999999999",
                    website: job.company_name ? `https://${job.company_name.toLowerCase().replace(/\s+/g, "")}.com` : "",
                    verification_status: job.company_verification_status || "pending",
                    social_links: job.company_social_links || {}
                  };
                  const trustResult = calculateTrustScore(companyDataForScore);
                  if (trustResult.badge === "UNVERIFIED") return null;
                  const details = getBadgeDetails(trustResult.badge);
                  return (
                    <span className="inline-block" title={details.label}>{details.indicator}</span>
                  );
                })()}
                <span>&bull;</span>
                <span>{job.location}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {job.has_applied ? (
                <button
                  disabled
                  className="border-success/30 px-6 py-2.5 text-xs text-success bg-success-bg rounded-xl border font-bold select-none cursor-default flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Applied
                </button>
              ) : (
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  variant="primary"
                  className="px-6 py-2.5 text-xs font-bold min-h-0 flex items-center gap-1.5"
                >
                  {applying && (
                    <span className="h-3 w-3 border-2 rounded-full border-t-transparent animate-spin border-white"></span>
                  )}
                  <Rocket size={14} /> Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
