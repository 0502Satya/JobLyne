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
    <div className="flex gap-8 flex-col">

      {/* Upcoming Interview Promo */}
      <div className="bg-gradient-primary shadow-md relative overflow-hidden text-white p-6 rounded-xl">
        <div className="bg-white/10 -mr-4 w-24 absolute blur-xl rounded-full h-24 -mt-4 right-0 top-0"></div>
        <div className="-mb-4 h-20 absolute blur-xl left-0 bg-black/10 -ml-4 rounded-full w-20 bottom-0"></div>
        <div className="relative z-10">
          <div className="justify-center h-10 w-10 items-center bg-white/20 mb-4 rounded-lg backdrop-blur-sm flex">
            <Video size={20} aria-hidden="true" />
          </div>
          <h3 className="mb-1 type-card-title">Interview Prep</h3>
          <p className="mb-4 text-sm text-white/80">Practice with our AI interviewer to boost your confidence.</p>
          <button 
            onClick={() => toast.info("AI Interview Prep session is coming soon!")}
            className="w-full text-primary bg-surface rounded-lg type-ui transition-colors py-2 hover:bg-primary/10 cursor-pointer"
          >
            Start Session
          </button>
        </div>
      </div>

      {/* Quick Links/Resume Services */}
      <div className="border-border shadow-sm p-6 bg-surface rounded-xl border">
        <h3 className="mb-4 text-text type-card-title">Resume Services</h3>
        <ul className="space-y-3">
          <li>
            <Link href="/dashboard/resume-preview" className="flex gap-3 items-center group">
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <FilePen size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">AI Resume Review</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={() => toast.info("Cover Letter Generator is coming soon!")}
              className="flex w-full gap-3 items-center group text-left cursor-pointer focus:outline-none"
            >
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <Palette size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">Cover Letter Generator</span>
            </button>
          </li>
          <li>
            <button 
              onClick={handleShareProfile}
              className="flex w-full gap-3 items-center group text-left cursor-pointer focus:outline-none"
            >
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <Share2 size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">Share Profile</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
