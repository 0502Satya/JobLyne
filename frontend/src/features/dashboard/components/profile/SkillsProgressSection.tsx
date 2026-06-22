"use client";

import React from "react";
import RadarChart from "./RadarChart";
import { Button } from "@/shared/ui";
import { Plus } from "lucide-react";

interface Skill {
  name: string;
  percentage: number;
}

interface SkillsProgressSectionProps {
  skills?: Skill[];
}

export default function SkillsProgressSection({ 
  skills = [
    { name: "UX Design", percentage: 90 },
    { name: "UI Design", percentage: 85 },
    { name: "Prototyping", percentage: 70 },
    { name: "User Research", percentage: 60 },
    { name: "Frontend", percentage: 75 },
  ]
}: SkillsProgressSectionProps) {
  const radarData = skills.map(s => ({ name: s.name, score: s.percentage }));

  return (
    <section className="mb-8 overflow-hidden rounded-[32px] bg-surface shadow-sm border-border p-8 border">
       <div className="flex mb-8 items-center justify-between">
          <h2 className="type-h2 text-text uppercase">Skills</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 gap-2 font-semibold"
          >
             <Plus size={16} aria-hidden="true" /> Add New Skill
          </Button>
       </div>

        <div className="space-y-12">
          <div className="border-border/50 justify-center bg-bg/40 rounded-[32px] items-center min-h-[320px] p-6 flex border">
             <RadarChart data={radarData} size={300} />
          </div>

          <div className="gap-6 grid grid-cols-1 px-2">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text uppercase tracking-wider type-badge">{skill.name}</span>
                  <span className="type-badge text-primary">{skill.percentage}%</span>
                </div>
                <div className="w-full border-border/30 h-2 overflow-hidden bg-bg rounded-full shadow-inner border">
                  <div 
                    className="h-full ease-out transition-all rounded-full duration-1000 shadow-primary/20 bg-primary shadow-lg"
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
       </div>
    </section>
  );
}
