"use client";

import React from "react";
import Link from "next/link";
import { Code2, Brain, Video, FilePen, Palette, Share2 } from "lucide-react";

export default function DashboardRightSidebar() {
  return (
    <div className="flex gap-8 flex-col">
      {/* Learning Progress */}
      <div className="border-border shadow-sm p-6 bg-surface rounded-xl border">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text type-card-title">Learning Progress</h3>
        </div>
        <div className="gap-4 flex flex-col">
          {/* Course 1 */}
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 justify-center h-10 w-10 text-primary items-center flex rounded bg-primary/10">
              <Code2 size={20} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-text type-ui leading-tight">Advanced React Patterns</h4>
              <p className="mb-2 text-xs text-muted">Module 4 of 12</p>
              <div className="w-full bg-border/20 h-1.5 rounded-full">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>
          </div>
          {/* Course 2 */}
          <div className="border-t border-border items-start gap-3 flex pt-4">
            <div className="flex-shrink-0 justify-center h-10 w-10 items-center bg-accent/10 flex text-accent rounded">
              <Brain size={20} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-text type-ui leading-tight">System Design Interview</h4>
              <p className="mb-2 text-xs text-muted">Module 8 of 10</p>
              <div className="w-full bg-border/20 h-1.5 rounded-full">
                <div className="bg-accent h-1.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-5 type-label bg-bg rounded-lg transition-colors py-2 hover:bg-border/40">
          View All Courses
        </button>
      </div>

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
          <button className="w-full text-primary bg-surface rounded-lg type-ui transition-colors py-2 hover:bg-primary/10">
            Start Session
          </button>
        </div>
      </div>

      {/* Quick Links/Resume Services */}
      <div className="border-border shadow-sm p-6 bg-surface rounded-xl border">
        <h3 className="mb-4 text-text type-card-title">Resume Services</h3>
        <ul className="space-y-3">
          <li>
            <Link href="#" className="flex gap-3 items-center group">
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <FilePen size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">AI Resume Review</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex gap-3 items-center group">
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <Palette size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">Cover Letter Generator</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex gap-3 items-center group">
              <div className="justify-center items-center bg-bg rounded-full transition-colors h-8 flex w-8 text-muted group-hover:bg-primary group-hover:text-white">
                <Share2 size={14} aria-hidden="true" />
              </div>
              <span className="transition-colors type-label group-hover:text-primary">Share Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
