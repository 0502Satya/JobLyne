"use client";

import React, { useMemo } from "react";
import { Button } from "@/shared/ui";
import {
  Briefcase,
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  Zap,
  PlusCircle,
  BadgeCheck,
  ClipboardCheck,
  Bookmark,
  BookmarkPlus,
  Rocket
} from "lucide-react";

interface JobDetailPanelProps {
  selectedJob: any;
  profile: any;
  savingId: string | null;
  applyingId: string | null;
  updatingSkill: string | null;
  onClose: () => void;
  onToggleSave: (e: React.MouseEvent, job: any) => void;
  onApply: (jobId: string) => void;
  onAddSkill: (skillName: string) => void;
}

export default function JobDetailPanel({
  selectedJob,
  profile,
  savingId,
  applyingId,
  updatingSkill,
  onClose,
  onToggleSave,
  onApply,
  onAddSkill,
}: JobDetailPanelProps) {
  // Partition skills into matching vs missing
  const skillAnalysis = useMemo(() => {
    if (!selectedJob) return { matching: [], missing: [], percentage: 0 };
    const jobSkills = selectedJob.skills || [];
    const candidateSkills = new Set(
      (profile?.skills || []).map((s: string) => s.toLowerCase())
    );

    const matching = jobSkills.filter((s: string) => candidateSkills.has(s.toLowerCase()));
    const missing = jobSkills.filter((s: string) => !candidateSkills.has(s.toLowerCase()));

    const percentage =
      jobSkills.length > 0 ? Math.round((matching.length / jobSkills.length) * 100) : 60;

    return { matching, missing, percentage };
  }, [selectedJob, profile]);

  if (!selectedJob) return null;

  const matchVal = selectedJob.match_score ?? 60;

  return (
    <div className="justify-end fade-in inset-0 animate-in bg-card/60 flex backdrop-blur-sm duration-300 z-50 fixed">
      {/* Dismissal Backdrop */}
      <div className="inset-0 absolute" onClick={onClose}></div>

      {/* Main Slide-in Drawer Container */}
      <div className="w-full h-full slide-in-from-right border-l border-border relative max-w-2xl overflow-hidden animate-in shadow-2xl duration-300 flex justify-between max-h-full bg-surface flex-col">
        {/* Header Block */}
        <div className="border-b items-center border-border/60 p-6 bg-bg/40 flex justify-between">
          <div className="gap-4 flex items-center">
            <div className="border-border/40 justify-center h-12 w-12 items-center p-2 bg-bg flex rounded-xl border">
              {selectedJob.company_logo ? (
                <img
                  src={selectedJob.company_logo}
                  alt={`${selectedJob.company_name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Briefcase className="text-primary" size={24} aria-hidden="true" />
              )}
            </div>
            <div>
              <h3 className="text-text line-clamp-1 type-card-title font-semibold">{selectedJob.title}</h3>
              <p className="type-label text-muted">
                {selectedJob.company_name} • {selectedJob.location}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 justify-center items-center bg-bg text-muted transition-colors h-11 flex rounded-xl hover:text-text hover:bg-border/20 cursor-pointer"
            aria-label="Close details"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable details body */}
        <div className="flex-1 overflow-y-auto gap-8 p-6 flex flex-col">
          {/* Score Meter & Match Analysis Grid */}
          <div className="rounded-2xl border-primary/20 items-center bg-primary/5 flex-col p-6 justify-between flex gap-6 border sm:flex-row">
            <div className="gap-4 flex items-center">
              <div className="justify-center shrink-0 h-20 relative items-center flex w-20">
                {/* SVG circular progress */}
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
                <span className="text-primary type-card-title absolute font-bold">
                  {matchVal}%
                </span>
              </div>
              <div>
                <h4 className="text-text gap-1 items-center text-base flex font-semibold">
                  AI Career Score
                </h4>
                <p className="type-caption text-muted mt-0.5">
                  Based on skill overlaps and profile relevance constraints.
                </p>
              </div>
            </div>

            <div className="flex text-right items-end flex-col sm:items-end">
              <span className="type-badge text-muted text-xs uppercase tracking-wider font-bold">Salary Range</span>
              <span className="text-success mt-1 type-card-title font-semibold">
                {selectedJob.salary_min
                  ? `${selectedJob.currency}${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max?.toLocaleString()}`
                  : "Not Disclosed"}
              </span>
            </div>
          </div>

          {/* Description Segment */}
          <div className="flex gap-2.5 flex-col">
            <h4 className="uppercase text-base items-center gap-2 tracking-wider flex text-muted font-bold text-sm">
              <FileText className="text-muted" size={18} aria-hidden="true" />
              Job Description
            </h4>
            <p className="bg-bg/20 text-sm border-border/30 leading-relaxed text-text/90 whitespace-pre-line p-4 rounded-xl border">
              {selectedJob.description || "No description provided."}
            </p>
          </div>

          {/* Dynamic AI Skill Match Section */}
          <div className="border-border/40 border-t gap-4 pt-6 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="uppercase text-base items-center gap-2 tracking-wider flex text-muted font-bold text-sm">
                <Sparkles className="text-primary" size={18} aria-hidden="true" />
                Required Skills Breakdown
              </h4>
              <span className="type-caption text-muted text-xs">
                {skillAnalysis.matching.length} of {selectedJob.skills?.length || 0} matching
              </span>
            </div>

            <div className="gap-4 flex flex-col">
              {/* Matching section */}
              {skillAnalysis.matching.length > 0 && (
                <div className="border-success/20 gap-2 flex-col flex bg-success-bg p-4 rounded-xl border">
                  <div className="type-badge text-success uppercase items-center gap-2 tracking-wider flex font-semibold text-xs">
                    <CheckCircle2 size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Your matching qualifications
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

              {/* Missing section */}
              {skillAnalysis.missing.length > 0 ? (
                <div className="gap-2 flex-col border-warning/20 flex p-4 bg-warning-bg rounded-xl border">
                  <div className="type-badge uppercase text-warning items-center gap-2 tracking-wider flex font-semibold text-xs">
                    <Zap size={16} aria-hidden="true" className="mr-1 inline-block" />
                    Recommended skills to add
                  </div>
                  <p className="type-caption text-muted text-xs">
                    Adding these skills will instantly boost your match ratio and increase visibility.
                  </p>

                  <div className="gap-2 flex mt-1 flex-wrap">
                    {skillAnalysis.missing.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => onAddSkill(skill)}
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
                  <span>Verified: You satisfy 100% of the requested skill criteria.</span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements text */}
          {selectedJob.requirements && (
            <div className="border-border/40 border-t gap-2.5 pt-6 flex flex-col">
              <h4 className="uppercase text-base items-center gap-2 tracking-wider flex text-muted font-bold text-sm">
                <ClipboardCheck className="text-muted" size={18} aria-hidden="true" />
                Prerequisites and expectations
              </h4>
              <p className="bg-bg/20 text-text/80 text-sm border-border/30 leading-relaxed whitespace-pre-line p-4 rounded-xl border">
                {selectedJob.requirements}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions Frame */}
        <div className="border-t gap-4 items-center border-border/60 p-6 bg-bg/40 flex justify-between">
          <button
            onClick={(e) => onToggleSave(e, selectedJob)}
            disabled={savingId !== null}
            className={`min-h-[48px] gap-1.5 px-5 items-center transition-all py-3 flex type-caption rounded-xl border cursor-pointer font-semibold ${
              selectedJob.is_saved
                ? "text-primary border-primary bg-primary/10"
                : "text-muted border-border/60 hover:bg-bg"
            }`}
          >
            {selectedJob.is_saved ? (
              <Bookmark className="text-primary fill-primary" size={16} aria-hidden="true" />
            ) : (
              <BookmarkPlus size={16} aria-hidden="true" />
            )}
            {selectedJob.is_saved ? "Bookmarked" : "Save Job"}
          </button>

          {selectedJob.has_applied ? (
            <button
              disabled
              className="border-success/30 px-8 min-h-[48px] gap-1.5 text-success items-center bg-success-bg py-3 type-ui flex rounded-xl border font-semibold"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Applied
            </button>
          ) : (
            <Button
              onClick={() => onApply(selectedJob.id)}
              disabled={applyingId !== null}
              variant="primary"
              className="relative justify-center px-8 min-h-[48px] gap-1.5 items-center py-3"
            >
              {applyingId === selectedJob.id && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 border-2 rounded-full h-4 border-t-transparent w-4 animate-spin border-white"></span>
              )}
              <Rocket size={16} aria-hidden="true" />
              Apply to opportunity
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
