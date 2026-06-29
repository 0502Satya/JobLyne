"use client";

import React from "react";
import { Briefcase, Bookmark, BookmarkPlus, Clock, Sparkles } from "lucide-react";

import { Job } from "@/types/job";

interface JobListItemProps {
  job: Job;
  isSelected: boolean;
  savingId: string | null;
  onSelect: () => void;
  onToggleSave: (e: React.MouseEvent, job: Job) => void;
}

export default function JobListItem({
  job,
  isSelected,
  savingId,
  onSelect,
  onToggleSave,
}: JobListItemProps) {
  const matchVal = job.match_score ?? 60;

  return (
    <div
      onClick={onSelect}
      className={`group gap-4 rounded-2xl transition-all shadow-sm flex-col flex p-6 cursor-pointer bg-surface border hover:shadow-md ${
        isSelected
          ? "ring-2 translate-x-1 ring-primary/10 border-primary shadow-lg"
          : "border-border/60 hover:border-primary/40"
      }`}
    >
      {/* Header line */}
      <div className="gap-4 flex items-start justify-between">
        <div className="gap-4 flex">
          <div className="border-border/40 justify-center shrink-0 items-center bg-bg transition-transform w-14 p-2.5 h-14 flex rounded-xl border group-hover:scale-105">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Briefcase size={24} className="text-primary" aria-hidden="true" />
            )}
          </div>
          <div>
            <h4 className="text-text type-card-title transition-colors line-clamp-1 leading-tight group-hover:text-primary font-semibold">
              {job.title}
            </h4>
            <p className="type-label mt-0.5 text-muted">
              {job.company_name} • {job.location}
            </p>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onToggleSave(e, job)}
          disabled={savingId === job.id}
          className={`w-11 justify-center items-center transition-all h-11 flex rounded-xl cursor-pointer ${
            job.is_saved
              ? "text-primary bg-primary/10"
              : "bg-bg text-muted hover:bg-primary/5 hover:text-primary"
          } shrink-0`}
          aria-label="Bookmark job"
        >
          {job.is_saved ? (
            <Bookmark size={20} className="fill-current text-primary" aria-hidden="true" />
          ) : (
            <BookmarkPlus size={20} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Description excerpt */}
      <p className="leading-relaxed line-clamp-2 text-sm text-muted/80">
        {job.description || "No description provided. Click to view matching analysis details."}
      </p>

      {/* Skill tags & salary info */}
      <div className="gap-2 flex flex-wrap items-center">
        {job.skills && job.skills.length > 0 ? (
          job.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="py-1 border-border/30 bg-bg rounded-lg px-2.5 type-caption text-muted border text-xs"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="py-1 border-border/30 bg-bg rounded-lg px-2.5 type-caption text-muted border text-xs">
            General
          </span>
        )}

        {job.salary_min && (
          <span className="py-1 border-success/20 text-success bg-success-bg rounded-lg px-2.5 ml-auto type-badge border text-xs font-semibold">
            {job.currency}
            {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
          </span>
        )}
      </div>

      {/* Meta section */}
      <div className="border-border/40 border-t items-center flex justify-between type-caption text-muted pt-4 text-xs">
        <div className="flex gap-1.5 items-center">
          <Clock size={14} className="text-muted" aria-hidden="true" />
          Posted {new Date(job.posted_at || job.created_at).toLocaleDateString()}
        </div>

        <div className="flex gap-3 items-center">
          {job.has_applied && (
            <div className="py-1 type-badge uppercase px-3 items-center rounded-full tracking-wider flex font-semibold text-success bg-success-bg border-success/20 border">
              Applied
            </div>
          )}
          {/* Match Indicator Pill */}
          <div
            className={`py-1 type-badge gap-1.5 uppercase px-3 items-center rounded-full tracking-wider flex font-semibold ${
              matchVal >= 80
                ? "text-success bg-success-bg border-success/20 border"
                : "text-primary border border-primary/20 bg-primary/10"
            }`}
          >
            <Sparkles size={14} className={matchVal >= 80 ? "fill-current text-success" : "fill-current text-primary"} aria-hidden="true" />
            {matchVal}% Match
          </div>
        </div>
      </div>
    </div>
  );
}
