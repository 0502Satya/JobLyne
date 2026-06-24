"use client";

import React from "react";
import { Briefcase, ArrowDown } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  count: number;
  time: string;
}

interface SkillProgress {
  label: string;
  percentage: number;
  color: string;
}

interface DashboardProfileWidgetProps {
  userName?: string;
  userRole?: string;
  profileImage?: string;
}

export default function DashboardProfileWidget({
  userName = "Oda Dink",
  userRole = "Programmer",
  profileImage
}: DashboardProfileWidgetProps) {
  const skills: SkillProgress[] = [
    { label: "PHP", percentage: 66, color: "var(--color-stat-lime)" },
    { label: "Vue", percentage: 31, color: "var(--color-stat-green)" },
    { label: "Laravel", percentage: 7, color: "var(--color-stat-blue)" }
  ];

  const activities: Activity[] = [
    { id: "1", type: "Vacancy", count: 3, time: "12h ago" },
    { id: "2", type: "Vacancy", count: 3, time: "12h ago" },
    { id: "3", type: "Vacancy", count: 3, time: "12h ago" }
  ];

  const displayName = userName || "User";

  return (
    <div className="w-full shrink-0 flex gap-6 flex-col">
      {/* Profile Summary Card */}
      <div className="p-10 rounded-[32px] items-center bg-surface text-center flex shadow-xl flex-col">
        {/* Progress Circle around Image */}
        <div className="h-36 relative mb-6 w-36">
          <svg className="w-full h-full -rotate-90">
            <circle cx="72" cy="72" r="68" fill="transparent" stroke="var(--color-chart-grid)" strokeWidth="8" />
            <circle
              cx="72" cy="72" r="68" fill="transparent"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeDasharray={427}
              strokeDashoffset={427 * (1 - 0.75)}
              strokeLinecap="round"
            />
          </svg>
          <div className="inset-0 absolute p-3">
             <div className="w-full h-full ring-4 overflow-hidden rounded-full ring-white bg-border shadow-inner">
               {profileImage ? (
                 <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full justify-center h-full to-accent-gradient italic items-center bg-gradient-to-br type-h1 from-primary text-white flex">
                   {displayName.charAt(0)}
                 </div>
               )}
             </div>
          </div>
        </div>

        <h3 className="text-text type-h2">{displayName}</h3>
        <p className="mb-10 text-muted uppercase tracking-wide type-caption">{userRole}</p>

        {/* Skill Circles */}
        <div className="w-full gap-4 items-center flex justify-between">
          {skills.map((skill) => (
            <div key={skill.label} className="flex-1 items-center gap-3 flex flex-col">
              <div className="h-16 relative w-16">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--color-chart-grid)" strokeWidth="6" />
                    <circle 
                      cx="32" cy="32" r="28" fill="transparent" stroke={skill.color} strokeWidth="6" 
                      strokeDasharray={176} 
                      strokeDashoffset={176 * (1 - skill.percentage / 100)}
                      strokeLinecap="round"
                    />
                 </svg>
                 <div className="justify-center text-xs inset-0 absolute items-center text-text flex">
                    {skill.percentage}%
                 </div>
              </div>
              <span className="text-muted type-badge">{skill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Card */}
      <div className="p-10 rounded-[32px] bg-surface shadow-xl grow">
        <h4 className="mb-8 type-card-title text-text">Recent Activities</h4>
        <div className="space-y-8 relative">
          {/* Vertical Line */}
          <div className="left-[24px] top-2 absolute w-0.5 bg-bg bottom-6"></div>

          {activities.map((activity) => (
            <div key={activity.id} className="z-10 group relative transition-all flex gap-5 cursor-default hover:translate-x-1">
              <div className="justify-center shrink-0 h-12 rounded-2xl w-12 items-center transition-all shadow-sm border-white flex bg-primary-light border group-hover:bg-primary group-hover:text-white">
                <Briefcase size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="leading-relaxed text-muted mb-1 type-caption">
                  Your application has accepted in <span className="text-primary">{activity.count} Vacancy</span>
                </p>
                <span className="text-xs uppercase tracking-widest text-muted">{activity.time}</span>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          <div className="flex justify-center mt-4">
             <button className="justify-center h-10 w-10 items-center transition-all bg-bg shadow-sm border-border rounded-full flex border hover:bg-bg">
               <ArrowDown size={18} className="text-muted" aria-hidden="true" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
