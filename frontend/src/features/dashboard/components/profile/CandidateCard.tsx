"use client";

import React from "react";
import { UserCircle, Camera, MapPin, Calendar } from "lucide-react";

interface CandidateCardProps {
  profileImage?: string;
  fullName?: string;
  category?: string;
  location?: string;
  memberSince?: string;
}

export default function CandidateCard({ 
  profileImage, 
  fullName = "Oda Dink", 
  category = "UX Designer",
  location = "London, England",
  memberSince = "Aug 2023"
}: CandidateCardProps) {
  return (
    <div className="rounded-[40px] items-center bg-surface border-border flex-col flex shadow-xl text-center p-8 border">
      {/* Profile Image with Ring */}
      <div className="relative mb-6">
        <div className="w-32 h-32 ring-4 ring-border overflow-hidden rounded-[32px] p-1 bg-surface shadow-inner">
          <div className="w-full rounded-[28px] justify-center h-full overflow-hidden items-center bg-bg flex">
            {profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" alt={fullName} />
            ) : (
              <UserCircle size={64} className="text-muted" aria-hidden="true" />
            )}
          </div>
        </div>
        <button className="justify-center h-12 rounded-2xl -right-2 absolute -bottom-2 w-12 items-center text-white transition-transform border-white border-4 bg-primary flex shadow-lg hover:scale-110">
          <Camera size={20} aria-hidden="true" />
        </button>
      </div>

      <h3 className="type-h2 mb-1 text-text">{fullName}</h3>
      <p className="text-xs text-primary uppercase mb-6 tracking-decorative">{category}</p>

      <div className="w-full border-t pt-6 border-border space-y-4">
        <div className="gap-4 flex text-left items-center">
          <div className="justify-center h-10 w-10 text-muted items-center bg-bg flex rounded-xl">
            <MapPin size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="mb-0.5 text-muted type-badge">Location</p>
            <p className="text-text type-ui">{location}</p>
          </div>
        </div>
        <div className="gap-4 flex text-left items-center">
          <div className="justify-center h-10 w-10 text-muted items-center bg-bg flex rounded-xl">
            <Calendar size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="mb-0.5 text-muted type-badge">Member Since</p>
            <p className="text-text type-ui">{memberSince}</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-card py-4 rounded-2xl uppercase mt-8 transition-all text-white tracking-widest shadow-lg shadow-slate-900/20 type-badge hover:bg-black">
        View Public Profile
      </button>
    </div>
  );
}
