"use client";

import React from "react";
import { Button, Icon } from "@/shared/ui";
import { Target, Pencil, Banknote, CheckCircle2 } from "lucide-react";

interface CareerProfileSectionProps {
  profile: any;
  onEdit: () => void;
}

export default function CareerProfileSection({ profile, onEdit }: CareerProfileSectionProps) {
  const fields = [
    { label: "Current Industry", value: profile?.industry || "Add Industry", icon: "business_center" },
    { label: "Functional Area", value: profile?.functional_area || "Add Area", icon: "settings" },
    { label: "Role", value: profile?.current_designation || "Add Role", icon: "person" },
    { label: "Desired Job Type", value: profile?.employment_type || "Permanent", icon: "work" },
    { label: "Desired Employment Type", value: profile?.work_mode?.join(", ") || "Full Time", icon: "badge" },
    { label: "Preferred Location", value: profile?.preferred_locations?.join(", ") || "Add Location", icon: "location_on" },
  ];

  return (
    <div className="mb-8 rounded-[32px] bg-surface border-border shadow-xl p-6 border sm:p-8">
      <div className="mb-10 flex-col flex gap-6 justify-between sm:flex-row sm:items-center">
        <div className="gap-4 flex items-center">
          <div className="justify-center shrink-0 h-12 rounded-2xl w-12 items-center flex bg-primary-light text-primary">
            <Target size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 className="type-h2 text-text leading-none mb-1">Career Profile</h3>
            <p className="text-muted type-badge">Your career goals</p>
          </div>
        </div>
         <div className="flex gap-3 flex-row sm:items-center">
             <Button 
                 onClick={onEdit}
                 variant="outline"
                 className="gap-2"
             >
                 <Pencil size={14} aria-hidden="true" />
                 Edit
             </Button>
             <Button variant="primary">
                 Save
             </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field, i) => (
          <div key={i} className="gap-2 flex flex-col">
            <div className="text-muted text-xs uppercase items-center tracking-widest gap-2 flex">
               <Icon name={field.icon} size={16} className="text-primary/60" aria-hidden="true" />
               {field.label}
            </div>
            <div className="text-text text-base ml-6">{field.value}</div>
          </div>
        ))}
      </div>
      
      {/* Expected Salary */}
      <div className="border-t mt-12 gap-8 pt-10 border-border flex justify-between flex-col sm:flex-row sm:items-center">
         <div className="flex gap-6 items-center">
            <div className="justify-center h-10 w-10 shrink-0 text-muted items-center bg-bg flex rounded-xl">
               <Banknote size={20} aria-hidden="true" />
            </div>
            <div>
               <div className="text-muted mb-1 type-badge">Expected Salary</div>
               <div className="text-text type-h2">
                  {profile?.currency || '₹'} {profile?.expected_salary || '0'} <span className="type-caption text-muted">/ Year</span>
               </div>
            </div>
         </div>
         <div className="flex items-center">
            <div className="border inline-flex items-center gap-2 border-primary/20 type-badge bg-primary-light/50 py-2 px-4 rounded-xl text-primary-dark">
               <CheckCircle2 size={12} aria-hidden="true" />
               Open to relocate
            </div>
         </div>
      </div>
    </div>
  );
}
