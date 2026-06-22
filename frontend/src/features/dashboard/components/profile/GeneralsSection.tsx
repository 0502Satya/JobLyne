"use client";

import React, { useState } from "react";
import { Input } from "@/shared/ui";
import { Settings } from "lucide-react";

interface GeneralsSectionProps {
  data: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    username?: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function GeneralsSection({ data, onChange }: GeneralsSectionProps) {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border p-6" id="generals">
      <div className="flex mb-6 items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Settings size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">General Account Settings</h3>
            <p className="text-xs text-muted mt-0.5">Manage your personal profile and account credentials</p>
          </div>
        </div>
        <div className="gap-2 flex items-center select-none">
          <span className="type-caption text-muted">Available for hire?</span>
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            onClick={() => setIsAvailable(!isAvailable)}
            className={`flex-shrink-0 relative min-h-[44px] w-12 h-6 rounded-full transition-colors cursor-pointer ${
              isAvailable ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`top-0.5 h-5 absolute transition-transform w-5 rounded-full shadow-xs bg-card ${
                isAvailable ? "right-0.5" : "left-0.5"
              }`}
            ></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Input 
          type="text" 
          label="First Name"
          value={data.first_name || ""} 
          onChange={(e) => onChange("first_name", e.target.value)}
          placeholder="First Name"
        />
        <Input 
          type="text" 
          label="Middle Name"
          value={data.middle_name || ""} 
          onChange={(e) => onChange("middle_name", e.target.value)}
          placeholder="Type here"
        />
        <Input 
          type="text" 
          label="Last Name"
          value={data.last_name || ""} 
          onChange={(e) => onChange("last_name", e.target.value)}
          placeholder="Last Name"
        />

        <div className="md:col-span-1">
          <Input 
            type="text" 
            label="Username"
            value={data.username || ""} 
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="username"
          />
        </div>

        <div className="md:col-span-1">
          <Input 
            type="password" 
            label="Password"
            defaultValue=".........."
            showVisibilityToggle
          />
        </div>

        <div className="md:col-span-1">
          <Input 
            type="password" 
            label="Re-Type Password"
            defaultValue=".........."
            showVisibilityToggle
          />
        </div>
      </div>
    </section>
  );
}

