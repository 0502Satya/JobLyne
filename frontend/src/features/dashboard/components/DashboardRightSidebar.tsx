"use client";

import React from "react";
import Link from "next/link";
import { Video, FilePen, Palette, Share2 } from "lucide-react";
import { toast } from "@/shared/ui";

export default function DashboardRightSidebar() {
  const handleShareProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const profileUrl = `${window.location.origin}/dashboard/profile`;
      navigator.clipboard.writeText(profileUrl)
        .then(() => {
          toast.success("Profile link copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy profile link");
        });
    }
  };

  return (
    <div className="flex gap-8 flex-col text-left">

      {/* Upcoming Interview Promo */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 shadow-lg relative overflow-hidden text-white p-6 rounded-2xl border border-indigo-500/20">
        <div className="bg-white/10 -mr-4 w-28 absolute blur-2xl rounded-full h-28 -mt-4 right-0 top-0"></div>
        <div className="-mb-4 h-24 absolute blur-2xl left-0 bg-black/20 -ml-4 rounded-full w-24 bottom-0"></div>
        <div className="relative z-10 space-y-4">
          <div className="justify-center h-11 w-11 items-center bg-white/20 rounded-xl backdrop-blur-md flex shadow-sm">
            <Video size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold tracking-tight">AI Interview Prep</h3>
            <p className="text-xs text-white/85 leading-relaxed">Practice mock interviews with our conversational AI agent and get instant grading feedback.</p>
          </div>
          <button 
            onClick={() => toast.info("AI Interview Prep session is coming soon!")}
            className="w-full text-indigo-700 bg-white font-bold rounded-xl transition-all py-2.5 text-xs hover:bg-white/95 active:scale-[0.98] cursor-pointer shadow-md"
          >
            Start Mock Session
          </button>
        </div>
      </div>

      {/* Quick Links/Resume Services */}
      <div className="border-border/60 shadow-sm p-6 bg-surface rounded-2xl border">
        <h3 className="mb-4 text-text text-sm font-bold uppercase tracking-wider text-muted">Resume Services</h3>
        <ul className="space-y-3">
          <li>
            <Link href="/dashboard/resume-preview" className="flex gap-3 items-center group transition-all duration-200 hover:translate-x-1">
              <div className="justify-center items-center bg-bg border border-border/30 rounded-xl transition-all duration-300 h-9 flex w-9 text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 shadow-sm">
                <FilePen size={15} aria-hidden="true" />
              </div>
              <span className="transition-colors text-sm font-semibold text-text group-hover:text-primary">AI Resume Review</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={() => toast.info("Cover Letter Generator is coming soon!")}
              className="flex w-full gap-3 items-center group text-left cursor-pointer focus:outline-none transition-all duration-200 hover:translate-x-1"
            >
              <div className="justify-center items-center bg-bg border border-border/30 rounded-xl transition-all duration-300 h-9 flex w-9 text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 shadow-sm">
                <Palette size={15} aria-hidden="true" />
              </div>
              <span className="transition-colors text-sm font-semibold text-text group-hover:text-primary">Cover Letter Generator</span>
            </button>
          </li>
          <li>
            <button 
              onClick={handleShareProfile}
              className="flex w-full gap-3 items-center group text-left cursor-pointer focus:outline-none transition-all duration-200 hover:translate-x-1"
            >
              <div className="justify-center items-center bg-bg border border-border/30 rounded-xl transition-all duration-300 h-9 flex w-9 text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 shadow-sm">
                <Share2 size={15} aria-hidden="true" />
              </div>
              <span className="transition-colors text-sm font-semibold text-text group-hover:text-primary">Share Profile</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
