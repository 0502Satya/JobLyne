"use client";

import React, { useEffect, useState } from "react";
import { getJobsAction, applyToJobAction, saveJobAction, unsaveJobAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function JobFeed() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";
  const location = searchParams?.get("location") || "";

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

  useEffect(() => {
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
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-surface rounded-xl animate-pulse border border-border shadow-sm"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span> 
          Smart Job Feed
        </h3>
        <Link href="/dashboard/jobs" className="text-primary text-sm font-bold hover:underline">View all</Link>
      </div>

      {jobs && jobs.length > 0 ? (
        jobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-bg flex items-center justify-center p-2 border border-border/40">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-indigo-600">token</span>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{job.title}</h4>
                  <p className="text-muted text-sm">{job.company_name} • {job.location}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSave(job.id, !!job.is_saved); }}
                className={`transition-colors ${job.is_saved ? 'text-primary' : 'text-muted hover:text-primary'}`}
              >
                <span className="material-symbols-outlined filled">{job.is_saved ? 'bookmark' : 'bookmark_add'}</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills?.length > 0 ? (
                job.skills.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-bg text-muted text-xs font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-md bg-bg text-muted text-xs font-medium">React</span>
                  <span className="px-2.5 py-1 rounded-md bg-bg text-muted text-xs font-medium">TypeScript</span>
                </>
              )}
              {job.salary_min && (
                <span className="px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                  {job.currency}{job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="flex items-center gap-1 text-xs text-muted">
                <span className="material-symbols-outlined text-sm">schedule</span> 
                Posted {new Date(job.posted_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {job.match_score || "95"}% Match
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
                  disabled={applying === job.id}
                  className="bg-text dark:bg-surface text-surface dark:text-text text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {applying === job.id ? "Applying..." : "Apply Now"}
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">search_off</span>
          <p className="text-slate-400 font-bold text-sm">No matching jobs found today.</p>
        </div>
      )}
    </div>
  );
}
