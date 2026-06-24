"use client";

import React from "react";
import { Button } from "@/shared/ui";
import Icon from "@/shared/ui/Icon";

const actions = [
  { icon: "school", label: "Add Degree", color: "bg-primary-light text-primary ring-primary/10" },
  { icon: "work_history", label: "Add Position", color: "bg-primary/5 text-primary ring-primary/10" },
  { icon: "person_add", label: "Add Role", color: "bg-accent/10 text-accent ring-accent/10" },
  { icon: "info", label: "Add Info", color: "bg-bg text-muted ring-border" },
];

export default function QuickActionButtons() {
  return (
    <div className="mb-8 gap-4 items-center flex-wrap flex">
      {actions.map((action, i) => (
        <Button 
          key={i}
          variant="outline"
          className={`px-6 py-4 ring-1 items-center transition-all shadow-sm gap-3 rounded-[24px] hover:scale-105 active:scale-95 ${action.color} h-auto min-h-0 border-transparent`}
        >
          <div className="justify-center h-10 w-10 bg-white/80 items-center shadow-sm transition-colors flex rounded-xl">
            <Icon name={action.icon} size={20} />
          </div>
          {action.label}
        </Button>
      ))}
    </div>
  );
}
