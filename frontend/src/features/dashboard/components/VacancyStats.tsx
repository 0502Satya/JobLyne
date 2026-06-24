"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

// Generate last 30 days labels (show every 5th day for readability)
function getLast30DaysLabels(): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (i % 5 === 0 || i === 0) {
      labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
  }
  return labels;
}

export default function VacancyStats() {
  const dayLabels = getLast30DaysLabels();

  return (
    <div className="w-full p-10 overflow-hidden rounded-[32px] bg-surface flex shadow-xl flex-col">
      {/* Header */}
      <div className="items-center flex-wrap mb-12 flex gap-6 justify-between">
        <h4 className="text-text type-h2">Vacancy Stats</h4>
        
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex gap-6 items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-primary h-2.5 w-5 rounded-full"></div>
              <span className="text-xs text-muted uppercase tracking-widest">Application Sent</span>
              <div className="relative rounded-full h-4 cursor-pointer w-8 bg-primary/20">
                <div className="top-0.5 right-0.5 h-3 absolute w-3 rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="h-2.5 w-5 rounded-full bg-stat-green"></div>
              <span className="text-xs text-muted uppercase tracking-widest">Interviews</span>
              <div className="bg-stat-green/20 relative rounded-full h-4 cursor-pointer w-8">
                <div className="top-0.5 right-0.5 h-3 absolute w-3 rounded-full bg-stat-green"></div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-border h-2.5 w-5 rounded-full"></div>
              <span className="text-xs text-muted uppercase tracking-widest">Rejected</span>
              <div className="relative rounded-full bg-bg h-4 cursor-pointer w-8">
                <div className="top-0.5 bg-border h-3 absolute w-3 rounded-full left-0.5"></div>
              </div>
            </div>
          </div>

          <div className="relative">
            <button className="text-xs text-muted px-6 rounded-2xl uppercase items-center transition-all bg-bg py-3 gap-3 border-border tracking-widest flex border hover:bg-bg">
              Last 30 Days
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full relative overflow-hidden h-[300px] mt-4">
        {/* Y-Axis Labels */}
        <div className="z-10 text-xs absolute pointer-events-none left-0 flex-col text-muted flex justify-between bottom-0 top-0">
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* Grid Lines */}
        <div className="absolute left-8 pointer-events-none flex-col flex justify-between bottom-0 right-0 top-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full border-t border-dashed bg-bg border-border h-[1px]"></div>
          ))}
        </div>

        {/* The SVG Chart — uses viewBox so it scales within the container */}
        <svg className="h-full absolute w-[calc(100%-32px)] left-8 bottom-0 right-0 top-0" viewBox="0 0 700 300" preserveAspectRatio="none">
          {/* Green Line (Interviews) */}
          <path 
            d="M 0 220 C 80 200, 120 180, 200 190 S 340 160, 420 180 S 520 210, 600 200 S 660 190, 700 185" 
            fill="none" 
            stroke="var(--color-stat-green)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Purple Line (Applications) */}
          <path 
            d="M 0 160 C 60 120, 140 180, 200 140 S 320 100, 400 150 S 500 170, 580 140 S 650 155, 700 145" 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />

          {/* Interactive Tooltip / Dot Mockup */}
          <g className="cursor-pointer group">
             <circle cx="580" cy="140" r="6" fill="var(--color-primary)" className="drop-shadow-lg" />
             <circle cx="580" cy="140" r="3" fill="white" />
             
             {/* Tooltip Popup */}
             <foreignObject x="420" y="50" width="160" height="85">
                <div className="gap-1.5 rounded-2xl p-3 bg-surface border-border flex-col shadow-2xl flex border">
                   <div className="text-muted uppercase text-xs text-center tracking-widest">Mar 18, 2026</div>
                   <div className="flex gap-3 items-center justify-between">
                      <div className="flex gap-1.5 items-center">
                         <div className="bg-primary h-2.5 w-2.5 rounded-full"></div>
                         <div>
                            <div className="leading-none text-sm">12</div>
                            <div className="text-xs uppercase text-muted">App. Sent</div>
                         </div>
                      </div>
                      <div className="flex gap-1.5 items-center">
                         <div className="h-2.5 w-2.5 rounded-full bg-stat-green"></div>
                         <div>
                            <div className="leading-none text-sm">3</div>
                            <div className="text-xs uppercase text-muted">Interviews</div>
                         </div>
                      </div>
                   </div>
                </div>
             </foreignObject>
          </g>
        </svg>
      </div>

      {/* X-Axis Labels — Last 30 days, showing every 5th day */}
      <div className="text-xs uppercase mt-10 ml-8 tracking-widest text-muted flex justify-between">
        {dayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* Bottom Legend */}
      <div className="justify-center border-t mt-12 pt-10 gap-10 items-center border-border flex">
         <div className="flex gap-3 items-center">
            <div className="bg-primary w-3 rounded-full h-3"></div>
            <span className="text-muted type-badge">Application Sent</span>
         </div>
         <div className="flex gap-3 items-center">
            <div className="w-3 rounded-full h-3 bg-stat-green"></div>
            <span className="text-muted type-badge">Interviews</span>
         </div>
         <div className="flex gap-3 items-center">
            <div className="bg-error w-3 rounded-full h-3"></div>
            <span className="text-muted type-badge">Rejected</span>
         </div>
      </div>
    </div>
  );
}
