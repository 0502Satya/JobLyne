"use client";

import React from "react";

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
    <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
      {/* Profile Image with Ring */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-[32px] overflow-hidden p-1 ring-4 ring-slate-50 shadow-inner bg-white">
          <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-100 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" alt={fullName} />
            ) : (
              <span className="material-symbols-outlined text-slate-200 text-6xl">account_circle</span>
            )}
          </div>
        </div>
        <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-xl">camera_alt</span>
        </button>
      </div>

      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{fullName}</h3>
      <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-6">{category}</p>

      <div className="w-full space-y-4 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-xl">location_on</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Location</p>
            <p className="text-sm font-bold text-slate-700">{location}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Member Since</p>
            <p className="text-sm font-bold text-slate-700">{memberSince}</p>
          </div>
        </div>
      </div>

      <button className="w-full mt-8 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20">
        View Public Profile
      </button>
    </div>
  );
}
