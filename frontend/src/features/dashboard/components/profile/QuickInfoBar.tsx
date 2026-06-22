"use client";

import React from "react";
import Icon from "@/shared/ui/Icon";

interface QuickInfoBarProps {
  profile: any;
}

export default function QuickInfoBar({ profile }: QuickInfoBarProps) {
  const stats = [
    { label: "Notice Period", value: profile?.notice_period || "Add", icon: "schedule" },
    { label: "Marital Status", value: profile?.marital_status || "Add", icon: "favorite" },
    { label: "Gender", value: profile?.gender || "Add", icon: "person" },
    { label: "Pincode", value: profile?.pincode || "Add", icon: "pin_drop" },
  ];

  return (
    <div className="gap-4 grid-cols-2 grid mb-6 md:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="group gap-4 rounded-3xl items-center transition-all bg-surface border-border shadow-sm flex p-5 border hover:shadow-md">
          <div className="justify-center text-primary h-12 rounded-2xl w-12 items-center bg-primary/5 transition-all flex group-hover:bg-primary group-hover:text-white">
            <Icon name={stat.icon} size={20} />
          </div>
          <div>
            <div className="text-muted type-badge leading-tight">{stat.label}</div>
            <div className="type-ui text-text mt-0.5">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
