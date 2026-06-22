"use client";

import React from "react";
import Icon from "@/shared/ui/Icon";

interface ProfileSidebarProps {
  completenessPct: number;
}

export default function ProfileSidebar({ completenessPct }: ProfileSidebarProps) {
  const sections = [
    { id: "personal", label: "Personal Info", icon: "person", missing: completenessPct < 80 },
    { id: "experience", label: "Experience", icon: "work", missing: false },
    { id: "education", label: "Education", icon: "school", missing: false },
    { id: "skills", label: "Skills", icon: "psychology", missing: false },
    { id: "preferences", label: "Preferences", icon: "tune", missing: false },
  ];

  return (
    <aside className="w-56 hidden flex-shrink-0 lg:block">
      <div className="sticky top-20 space-y-1">
        <p className="mb-3 text-muted uppercase px-3 tracking-widest type-caption">Sections</p>
        
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-muted border-transparent items-center transition-all gap-3 py-2.5 border-l-3 flex px-4 rounded-xl hover:bg-surface dark:hover:bg-card"
          >
            <Icon name={section.icon} size={20} />
            <span className="text-sm">{section.label}</span>
            {section.missing && (
              <span className="h-2 w-2 rounded-full ml-auto bg-amber-400" title="Missing fields"></span>
            )}
          </a>
        ))}

        {/* Completeness */}
        <div className="rounded-2xl mt-6 bg-surface border-border shadow-sm p-4 border dark:bg-card dark:border-border">
          <div className="flex mb-2 text-xs justify-between">
            <span className="text-text">Profile strength</span>
            <span className="weight-display text-primary">{completenessPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-border mb-2 dark:bg-border">
            <div 
              className="bg-primary transition-all h-1.5 rounded-full" 
              style={{ width: `${completenessPct}%` }}
            ></div>
          </div>
          <p className="leading-relaxed text-xs text-muted">
            {completenessPct < 100 ? (
              <>Add more details to reach <span className="text-primary">100%</span></>
            ) : (
              <span className="text-green-500">Profile complete!</span>
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}
