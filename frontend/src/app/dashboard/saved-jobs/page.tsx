"use client";

import React, { useEffect, useState } from "react";
import { getSavedJobsAction, unsaveJobAction, applyToJobAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/ui";
import { Briefcase, Bookmark, Clock, Banknote } from "lucide-react";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const loadData = async () => {
    const savedData = await getSavedJobsAction();
    if (savedData.error) toast.error("Failed to load saved jobs");
    else setJobs(savedData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUnsave = async (jobId: string) => {
    const res = await unsaveJobAction(jobId);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Removed from saved");
      setJobs(jobs.filter(j => j.id !== jobId));
    }
  };

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    const res = await applyToJobAction(jobId);
    if (res.error) toast.error(res.error);
    else toast.success("Application submitted successfully!");
    setApplying(null);
  };

  if (loading) {
    return (
      <div className="items-center flex justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-b-2 rounded-full border-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] p-4 mx-auto md:p-8 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="type-h2 mb-1 text-text">Saved Jobs</h1>
        <p className="text-muted">Jobs you&apos;ve saved for later. Take your time to apply.</p>
      </div>

      {/* Job Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group gap-4 rounded-2xl transition-all bg-surface border-border shadow-sm flex-col p-6 flex border hover:shadow-md"
          >
            {/* Card Top */}
            <div className="flex gap-3 items-start justify-between">
              <div className="flex gap-3 items-center min-w-0">
                <div className="justify-center shrink-0 h-12 w-12 items-center bg-bg border-border flex rounded-xl border">
                  {job.company_logo ? (
                     <img src={job.company_logo} alt={`${job.company_name} logo`} className="h-8 w-8 object-contain" />
                  ) : (
                    <Briefcase className="text-primary" size={24} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="type-ui truncate transition-colors text-text group-hover:text-primary">
                    {job.title}
                  </h4>
                  <p className="truncate text-muted type-caption">
                    {job.company_name} • {job.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUnsave(job.id)}
                className="text-primary shrink-0 rounded-lg transition-colors p-1.5 hover:bg-primary/8 cursor-pointer"
                title="Remove from saved"
              >
                <Bookmark size={20} className="fill-primary text-primary" aria-hidden="true" />
              </button>
            </div>

            {/* Meta */}
            <div className="text-xs text-muted gap-2 flex-wrap flex">
              <span className="gap-1 flex items-center">
                <Clock size={14} aria-hidden="true" />
                {new Date(job.posted_at).toLocaleDateString()}
              </span>
              <span className="gap-1 flex items-center">
                <Banknote size={14} aria-hidden="true" />
                {job.currency}{job.salary_min}–{job.salary_max}
              </span>
            </div>

            {/* Actions */}
            <div className="border-t mt-auto items-center gap-2 border-border flex pt-4">
              <Button 
                variant="ghost" 
                className="flex-1 py-2 min-h-0"
              >
                View Details
              </Button>
              <Button
                onClick={() => handleApply(job.id)}
                disabled={applying === job.id}
                variant="primary"
                className="flex-1 py-2 min-h-0"
              >
                {applying === job.id ? "Applying..." : "Apply Now"}
              </Button>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 border-dashed rounded-2xl py-24 text-center bg-surface border-border border">
            <div className="flex gap-3 items-center flex-col">
              <Bookmark size={48} className="text-muted" aria-hidden="true" />
              <p className="text-muted">You haven&apos;t saved any jobs yet.</p>
              <a href="/dashboard" className="type-ui text-primary hover:underline">Discover Jobs →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
