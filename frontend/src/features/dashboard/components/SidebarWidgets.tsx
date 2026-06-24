"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getActionPlanAction } from "@/features/auth/actions";
import { CalendarClock, ArrowRight, Code2, Brain, Video, FilePen, Palette, Share2 } from "lucide-react";
import Icon from "@/shared/ui/Icon";

export default function SidebarWidgets() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActions() {
      const data = await getActionPlanAction();
      if (!data.error) {
        setActions(data);
      }
      setLoading(false);
    }
    fetchActions();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-6 flex-col">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse bg-surface border-border rounded-2xl border dark:bg-card"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-8 flex-col text-left">
      {/* Today's Action Plan */}
      <div className="bg-surface border-border shadow-sm p-6 rounded-2xl border dark:bg-card">
        <h3 className="type-card-title items-center mb-4 gap-2 text-text flex font-semibold">
          <CalendarClock size={20} className="text-primary font-bold" aria-hidden="true" />
          Today&apos;s Action Plan
        </h3>
        <ul className="text-sm space-y-4">
          {actions.map((action) => (
            <li key={action.id} className="flex gap-3 text-muted">
              <Icon name={action.icon} size={20} className="text-primary font-bold" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-text type-ui font-semibold">{action.title}</p>
                <p className="mb-2 text-xs">{action.description}</p>
                <Link 
                  href={action.link} 
                  className="text-primary gap-1 inline-flex items-center type-caption hover:underline font-bold"
                >
                  Get started
                  <ArrowRight size={12} className="font-bold" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
          {actions.length === 0 && (
            <li className="italic text-muted py-2 text-center font-medium">
              All caught up! ✨ Check back later for more tips.
            </li>
          )}
        </ul>
      </div>

      {/* Learning Progress */}
      <div className="bg-surface border-border shadow-sm p-6 rounded-2xl border dark:bg-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text type-card-title font-semibold">Learning Progress</h3>
        </div>
        <div className="gap-4 flex flex-col">
          {/* Course 1 */}
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 justify-center h-10 w-10 text-info items-center bg-info-bg border border-info/10 flex rounded-xl">
              <Code2 size={20} className="font-bold" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="type-ui text-text leading-tight font-semibold">Advanced React Patterns</h4>
              <p className="text-muted mb-2 text-xs font-medium">Module 4 of 12</p>
              <div className="w-full h-1.5 bg-bg rounded-full dark:bg-card">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>
          </div>
          {/* Course 2 */}
          <div className="border-t items-start border-border gap-3 flex pt-4 dark:border-border">
            <div className="flex-shrink-0 justify-center h-10 w-10 bg-primary/10 border border-primary/5 items-center flex text-primary rounded-xl">
              <Brain size={20} className="font-bold" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="type-ui text-text leading-tight font-semibold">System Design Interview</h4>
              <p className="text-muted mb-2 text-xs font-medium">Module 8 of 10</p>
              <div className="w-full h-1.5 bg-bg rounded-full dark:bg-card">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-5 bg-bg text-text rounded-xl type-ui transition-colors py-2.5 dark:bg-card hover:bg-bg dark:hover:bg-border cursor-pointer font-bold min-h-[40px]">
          View All Courses
        </button>
      </div>

      {/* Upcoming Interview Promo */}
      <div className="shadow-md relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-2xl">
        {/* Abstract Background Shapes */}
        <div className="bg-white/10 -mr-4 w-24 absolute blur-xl rounded-full h-24 -mt-4 right-0 top-0"></div>
        <div className="-mb-4 h-20 absolute blur-xl left-0 bg-black/10 -ml-4 rounded-full w-20 bottom-0"></div>
        <div className="relative z-10">
          <div className="justify-center h-10 w-10 items-center bg-white/20 mb-4 rounded-lg backdrop-blur-sm flex">
            <Video size={20} className="font-bold" aria-hidden="true" />
          </div>
          <h3 className="mb-1 type-card-title font-bold">Interview Prep</h3>
          <p className="mb-4 text-sm text-primary-light">Practice with our AI interviewer to boost your confidence.</p>
          <button className="w-full text-primary bg-surface rounded-xl type-ui transition-colors py-2.5 hover:bg-primary-light/10 hover:text-white font-bold cursor-pointer min-h-[40px] border-none">
            Start Session
          </button>
        </div>
      </div>

      {/* Quick Links/Resume Services */}
      <div className="bg-surface border-border shadow-sm p-6 rounded-2xl border dark:bg-card">
        <h3 className="mb-4 text-text type-card-title font-semibold">Resume Services</h3>
        <ul className="space-y-3">
          <li>
            <button className="w-full group items-center gap-3 flex text-left cursor-pointer">
              <div className="justify-center text-muted items-center rounded-full bg-bg transition-colors h-8 flex w-8 dark:bg-card group-hover:bg-primary group-hover:text-white">
                <FilePen size={14} className="font-bold" aria-hidden="true" />
              </div>
              <span className="text-text type-ui transition-colors group-hover:text-primary font-semibold">AI Resume Review</span>
            </button>
          </li>
          <li>
            <button className="w-full group items-center gap-3 flex text-left cursor-pointer">
              <div className="justify-center text-muted items-center rounded-full bg-bg transition-colors h-8 flex w-8 dark:bg-card group-hover:bg-primary group-hover:text-white">
                <Palette size={14} className="font-bold" aria-hidden="true" />
              </div>
              <span className="text-text type-ui transition-colors group-hover:text-primary font-semibold">Cover Letter Generator</span>
            </button>
          </li>
          <li>
            <button className="w-full group items-center gap-3 flex text-left cursor-pointer">
              <div className="justify-center text-muted items-center rounded-full bg-bg transition-colors h-8 flex w-8 dark:bg-card group-hover:bg-primary group-hover:text-white">
                <Share2 size={14} className="font-bold" aria-hidden="true" />
              </div>
              <span className="text-text type-ui transition-colors group-hover:text-primary font-semibold">Share Profile</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
