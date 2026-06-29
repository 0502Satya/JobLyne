"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getJobsAction, applyToJobAction, saveJobAction, unsaveJobAction } from "@/features/auth/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, LoadingState, EmptyState, toast } from "@/shared/ui";
import { Sparkles, Coins, Bookmark, BookmarkPlus, Clock } from "lucide-react";
import type { Job } from "@/types/job";
import { generateJobSlug } from "@/shared/utils/slug";

export default function JobFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const query = searchParams?.get("query") ?? "";
  const location = searchParams?.get("location") ?? "";

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await getJobsAction({ query, location });
        if (data && !data.error) {
          setJobs(Array.isArray(data) ? data : (data.results ?? []));
        } else {
          setJobs([]);
        }
      } catch {
        // No console.error in production (Issue #11)
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [query, location]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      const res = await applyToJobAction(jobId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Application submitted successfully!");
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, has_applied: true } : j));
      }
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  const handleSave = async (jobId: string, isCurrentlySaved: boolean) => {
    try {
      if (isCurrentlySaved) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: false } : j));
        let undone = false;

        toast.custom((t: any) => (
          <div role="status" aria-live="polite"
            className={`${t.visible ? "animate-in fade-in" : "animate-out fade-out"}
              max-w-sm w-full bg-card border border-border/80 shadow-lg rounded-xl
              pointer-events-auto flex items-center justify-between p-4 gap-4`}
          >
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-sm text-text">Job removed from saved</span>
            </div>
            <button
              onClick={() => {
                undone = true;
                toast.dismiss(t.id);
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: true } : j));
              }}
              className="text-primary hover:text-primary/80 text-sm font-semibold whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Undo
            </button>
          </div>
        ), { duration: 5000 });

        undoTimerRef.current = setTimeout(async () => {
          if (!undone) {
            const res = await unsaveJobAction(jobId);
            if (res.error) {
              toast.error("Failed to unsave job");
              setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: true } : j));
            }
          }
        }, 5000);
      } else {
        const res = await saveJobAction(jobId);
        if (!res.error) {
          toast.success("Job saved!");
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: true } : j));
        }
      }
    } catch {
      toast.error("Failed to update saved status");
    }
  };

  if (loading) return <LoadingState variant="list" rows={3} />;

  return (
    <div className="flex gap-6 flex-col text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-text type-h3 items-center gap-2 flex font-bold">
          <Sparkles size={20} className="text-primary" aria-hidden="true" />
          Smart Job Feed
        </h3>
        <Link href="/jobs" className="type-ui text-primary hover:underline font-bold">
          View all
        </Link>
      </div>

      {jobs.length > 0 ? jobs.map((job) => (
        <div key={job.id}
          onClick={() => router.push(`/jobs/${generateJobSlug(job)}`)}
          className="border-border/60 group shadow-sm transition-all duration-300 p-6 bg-surface rounded-2xl border hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 cursor-pointer text-left border-l-4 border-l-transparent hover:border-l-primary"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="gap-4 flex">
              <div className="border-border/40 justify-center h-12 w-12 items-center p-2 bg-bg rounded-xl flex border transition-transform duration-300 group-hover:scale-105">
                {job.company_logo
                  ? <Image src={job.company_logo} alt={`${job.company_name} logo`}
                            width={40} height={40} className="w-full h-full object-contain" />
                  : <Coins size={28} className="text-primary" aria-hidden="true" />
                }
              </div>
              <div>
                <h4 className="text-text transition-colors type-card-title group-hover:text-primary font-bold text-base leading-snug">
                  {job.title}
                </h4>
                <p className="text-xs text-muted font-medium mt-0.5">{job.company_name} • {job.location}</p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleSave(job.id, !!job.is_saved); }}
              aria-label={job.is_saved ? "Remove from saved jobs" : "Save this job"}
              className={`transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-bg ${job.is_saved ? "text-primary" : "text-muted hover:text-primary"}`}
            >
              {job.is_saved
                ? <Bookmark size={20} className="fill-current" aria-hidden="true" />
                : <BookmarkPlus size={20} aria-hidden="true" />
              }
            </button>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="gap-2 flex mb-4 flex-wrap">
              {job.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="py-1 bg-bg px-2.5 rounded-lg text-xs text-muted font-medium border border-border/20">
                  {skill}
                </span>
              ))}
              {job.salary_min && (
                <span className="py-1 text-success bg-success-bg/30 border border-success/20 px-2.5 rounded-lg text-xs font-semibold">
                  {job.currency}{job.salary_min.toLocaleString()}
                  {job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : "+"}
                </span>
              )}
            </div>
          )}

          <div className="border-border/40 border-t items-center flex justify-between pt-4">
            <div className="text-xs gap-1 items-center flex text-muted font-medium">
              <Clock size={14} aria-hidden="true" />
              Posted {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "N/A"}
            </div>
            <div className="gap-2 flex items-center">
              {job.match_score != null && job.match_score > 0 && (
                <span className="px-2.5 text-primary py-1 text-xs rounded-lg bg-primary/10 font-bold border border-primary/20 shadow-sm shadow-primary/5">
                  {job.match_score}% Match
                </span>
              )}
              {job.has_applied ? (
                <Button size="sm" variant="secondary" disabled className="bg-success-bg/30 border border-success/20 text-success rounded-lg">
                  Applied
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={applying === job.id}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApply(job.id); }}
                  className="rounded-lg shadow-sm font-semibold cursor-pointer"
                >
                  Apply now
                </Button>
              )}
            </div>
          </div>
        </div>
      )) : (
        <EmptyState
          preset="search"
          title="No matching jobs found today"
          description="No jobs matched your current profile keywords or search filters."
          icon="search_off"
          actionLabel="Browse all jobs"
          onAction={() => router.push("/jobs")}
        />
      )}
    </div>
  );
}
