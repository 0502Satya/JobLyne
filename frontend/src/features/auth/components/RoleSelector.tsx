"use client";

import React from "react";
import Icon from "@/shared/ui/Icon";
import { CheckCircle2 } from "lucide-react";

interface RoleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const roles: RoleOption[] = [
  { id: "Candidate", name: "Candidate", description: "I'm looking for a job or career development.", icon: "person" },
  { id: "Recruiter", name: "Recruiter", description: "I'm sourcing top talent for my clients.", icon: "groups" },
  { id: "Company", name: "Company", description: "I'm hiring for my own organization.", icon: "business" },
];

/**
 * Re-implemented RoleSelector for restoration.
 * Allows users to choose their role during the signup process.
 */
export default function RoleSelector({ selected, onSelect }: { selected: string, onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onSelect(role.id)}
          className={`gap-4 border-2 items-center transition-all flex p-4 text-left rounded-xl ${
            selected === role.id 
              ? "bg-primary/5 ring-4 ring-primary/10 border-primary" 
              : "border-border bg-surface dark:bg-card dark:border-border hover:border-border dark:hover:border-border"
          }`}
        >
          <div className={`rounded-lg p-2 ${selected === role.id ? "bg-primary text-white" : "text-muted bg-bg dark:bg-card"}`}>
            <Icon name={role.icon} size={20} />
          </div>
          <div>
            <h4 className="text-text">{role.name}</h4>
            <p className="text-muted text-xs">{role.description}</p>
          </div>
          {selected === role.id && (
            <CheckCircle2 size={20} className="ml-auto text-primary" aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  );
}
