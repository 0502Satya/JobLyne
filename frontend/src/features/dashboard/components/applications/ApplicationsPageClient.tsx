"use client";

import React, { useState, useEffect } from "react";
import { CandidateApplication } from "@/types/application";
import { Calendar, ClipboardCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/shared/ui";
import { generateJobSlug } from "@/shared/utils/slug";
import { getJobDetailAction, getCandidateProfileAction } from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import JobDetailPanel from "@/features/jobs/components/JobDetailPanel";

interface ApplicationsPageClientProps {
  initialApplications: CandidateApplication[];
}

export default function ApplicationsPageClient({ initialApplications }: ApplicationsPageClientProps) {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fetchingJobId, setFetchingJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getCandidateProfileAction();
      if (res && !res.error) {
        setProfile(res);
      }
    };
    fetchProfile();
  }, []);

  const handleViewDetails = async (jobId: string) => {
    setFetchingJobId(jobId);
    try {
      const res = await getJobDetailAction(jobId);
      if (res.error) {
        toast.error("Failed to load job details.");
      } else {
        setSelectedJob(res);
      }
    } catch (e) {
      toast.error("Failed to fetch details.");
    } finally {
      setFetchingJobId(null);
    }
  };

  const getStatusClass = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s === "APPLIED") return "text-info bg-info-bg border-info/20";
    if (s === "INTERVIEW") return "text-warning bg-warning-bg border-warning/20";
    if (s === "OFFER") return "text-success bg-success-bg border-success/20";
    if (s === "REJECTED" || s === "DECLINED") return "text-error bg-error-bg border-error/20";
    return "text-muted bg-bg border-border/40";
  };

  return (
    <div className="max-w-[1400px] p-4 mx-auto md:p-8 lg:p-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "My Applications" },
        ]}
        className="mb-4"
      />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="type-h2 mb-1 text-text">My Applications</h1>
        <p className="text-muted">Track the status of your active job applications.</p>
      </div>

      {/* Responsive Layout wrapper */}
      <div className="rounded-2xl overflow-hidden bg-surface border-border shadow-sm border">
        
        {/* Mobile View: Card List (md:hidden) */}
        <div className="block md:hidden divide-y divide-border">
          {initialApplications.map((app) => (
            <div key={app.id} className="p-5 hover:bg-bg/40 transition-colors flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <span className="type-ui font-semibold text-text leading-snug">
                  {app.job_title}
                </span>
                <span className={`py-1 text-[10px] font-bold uppercase tracking-wider px-2.5 rounded-full border shrink-0 ${getStatusClass(app.status)}`}>
                  {app.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted">
                <span>{app.company_name}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} aria-hidden="true" />
                  {new Date(app.applied_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button 
                  onClick={() => handleViewDetails(app.job)}
                  disabled={fetchingJobId === app.job}
                  className="type-ui text-primary hover:underline text-xs min-h-[40px] px-3 flex items-center font-bold cursor-pointer disabled:opacity-50 gap-1.5"
                >
                  {fetchingJobId === app.job && <Loader2 size={12} className="animate-spin" />}
                  View Details
                </button>
              </div>
            </div>
          ))}

          {initialApplications.length === 0 && (
            <div className="text-center py-20 px-6">
              <div className="flex gap-4 items-center flex-col max-w-xs mx-auto">
                <ClipboardCheck size={48} className="text-muted" aria-hidden="true" />
                <div>
                  <p className="text-text font-semibold type-ui">No applications yet</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">You haven&apos;t applied to any job listings on our platform yet.</p>
                </div>
                <Link href="/jobs" className="type-ui text-primary hover:underline font-bold mt-2">Browse Jobs →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View: Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="text-xs text-muted px-6 py-4 uppercase tracking-wider font-semibold">Job Role</th>
                <th className="text-xs text-muted px-6 py-4 uppercase tracking-wider font-semibold">Company</th>
                <th className="text-xs text-muted px-6 py-4 uppercase tracking-wider font-semibold">Date Applied</th>
                <th className="text-xs text-muted px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                <th className="text-xs text-muted px-6 py-4 uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialApplications.map((app) => (
                <tr key={app.id} className="hover:bg-bg/40 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="type-ui transition-colors text-text group-hover:text-primary font-semibold">
                      {app.job_title}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-muted text-sm">{app.company_name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`py-1 text-[10px] font-bold uppercase tracking-wider px-2.5 rounded-full border ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleViewDetails(app.job)}
                      disabled={fetchingJobId === app.job}
                      className="type-ui text-primary hover:underline font-bold min-h-[36px] px-3 flex items-center cursor-pointer disabled:opacity-50 gap-1.5"
                    >
                      {fetchingJobId === app.job && <Loader2 size={12} className="animate-spin" />}
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {initialApplications.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-24 px-6">
                    <div className="flex gap-4 items-center flex-col max-w-sm mx-auto">
                      <ClipboardCheck size={48} className="text-muted" aria-hidden="true" />
                      <div>
                        <p className="text-text font-semibold type-ui">No applications yet</p>
                        <p className="text-xs text-muted mt-1 leading-relaxed">You haven&apos;t applied to any job listings on our platform yet.</p>
                      </div>
                      <Link href="/jobs" className="type-ui text-primary hover:underline font-bold mt-2">Browse Jobs →</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      <JobDetailPanel
        selectedJob={selectedJob}
        profile={profile}
        savingId={null}
        applyingId={null}
        updatingSkill={null}
        onClose={() => setSelectedJob(null)}
        onToggleSave={() => {}}
        onApply={() => {}}
        onAddSkill={() => {}}
      />
    </div>
  );
}
