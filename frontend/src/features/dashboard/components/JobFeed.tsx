"use client";

import React, { useEffect, useState } from "react";
import { getJobsAction, applyToJobAction, saveJobAction, unsaveJobAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Coins, Bookmark, BookmarkPlus, Clock, SearchX } from "lucide-react";

export default function JobFeed() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";
  const location = searchParams?.get("location") || "";

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await getJobsAction({ query, location });
        if (data && !data.error) {
          setJobs(Array.isArray(data) ? data : (data.results || []));
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("JobFeed Load Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [query, location]);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      const res = await applyToJobAction(jobId);
      if (res.error) toast.error(res.error);
      else toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error("Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  const handleSave = async (jobId: string, isCurrentlySaved: boolean) => {
    try {
      if (isCurrentlySaved) {
        const res = await unsaveJobAction(jobId);
        if (!res.error) {
          toast.success("Removed from saved");
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: false } : j));
        }
      } else {
        const res = await saveJobAction(jobId);
        if (!res.error) {
          toast.success("Job saved!");
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: true } : j));
        }
      }
    } catch (err) {
      toast.error("Failed to update saved status");
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 flex-col">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border animate-pulse shadow-sm h-44 bg-surface rounded-xl border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 flex-col text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-text type-h3 items-center gap-2 flex font-bold">
          <Sparkles size={20} className="text-primary font-bold" aria-hidden="true" />
          Smart Job Feed
        </h3>
        <Link href="/jobs" className="type-ui text-primary hover:underline font-bold">View all</Link>
      </div>

      {jobs && jobs.length > 0 ? (
        jobs.map((job) => (
          <div 
            key={job.id} 
            className="border-border group shadow-sm transition-shadow p-6 cursor-pointer bg-surface rounded-xl border hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="gap-4 flex">
                <div className="border-border/40 justify-center h-12 w-12 items-center p-2 bg-bg rounded-lg flex border">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={`${job.company_name} logo`} className="w-full h-full object-contain" />
                  ) : (
                    <Coins size={28} className="text-primary font-bold" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h4 className="text-text transition-colors type-card-title group-hover:text-primary font-semibold">{job.title}</h4>
                  <p className="text-sm text-muted">{job.company_name} • {job.location}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSave(job.id, !!job.is_saved); }}
                className={`transition-colors cursor-pointer ${job.is_saved ? 'text-primary' : 'text-muted hover:text-primary'}`}
              >
                {job.is_saved ? <Bookmark size={20} className="fill-current" aria-hidden="true" /> : <BookmarkPlus size={20} aria-hidden="true" />}
              </button>
            </div>
            
            <div className="gap-2 flex mb-4 flex-wrap">
              {job.skills?.length > 0 ? (
                job.skills.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="py-1 bg-bg px-2.5 rounded-md type-caption text-muted font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <>
                  <span className="py-1 bg-bg px-2.5 rounded-md type-caption text-muted font-medium">React</span>
                  <span className="py-1 bg-bg px-2.5 rounded-md type-caption text-muted font-medium">TypeScript</span>
                </>
              )}
              {job.salary_min && (
                <span className="py-1 text-success bg-success-bg border border-success/10 px-2.5 rounded-md type-caption font-semibold">
                  {job.currency}{job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                </span>
              )}
            </div>

            <div className="border-border/40 border-t items-center flex justify-between pt-4">
              <div className="text-xs gap-1 items-center flex text-muted">
                <Clock size={14} className="font-bold" aria-hidden="true" />
                Posted {new Date(job.posted_at).toLocaleDateString()}
              </div>
              <div className="gap-2 flex items-center">
                <span className="px-2 text-primary py-1 type-caption rounded bg-primary/10 font-bold border border-primary/5">
                  {job.match_score || "95"}% Match
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
                  disabled={applying === job.id}
                  className="bg-text rounded-lg type-ui py-2 px-4 text-white transition-opacity dark:text-text dark:bg-surface hover:opacity-90 disabled:opacity-50 font-bold cursor-pointer min-h-[40px] flex items-center"
                >
                  {applying === job.id ? "Applying..." : "Apply now"}
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="border-dashed py-20 text-center bg-surface border-border shadow-sm rounded-xl border dark:bg-card dark:border-border px-6">
          <div className="flex gap-4 items-center flex-col max-w-sm mx-auto">
            <SearchX size={40} className="text-muted font-bold" aria-hidden="true" />
            <div>
              <p className="type-ui font-semibold text-text">No matching jobs found today</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">No jobs matched your current profile keywords or search filters.</p>
            </div>
            <div className="flex gap-3 mt-2 flex-col w-full sm:flex-row">
              <Link 
                href="/dashboard/profile"
                className="flex-1 text-center justify-center min-h-[40px] px-4 py-2 border border-border text-xs font-bold rounded-lg type-ui transition-colors hover:bg-bg flex items-center"
              >
                Update Skills
              </Link>
              <Link 
                href="/jobs" 
                className="flex-1 text-center justify-center min-h-[40px] px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg type-ui transition-colors hover:bg-primary/95 flex items-center shadow-md shadow-primary/10"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
