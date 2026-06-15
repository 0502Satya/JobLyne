"use client";

import React, { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 tracking-tight font-display uppercase">Generals</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Available for hire?</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">First Name</label>
          <input 
            type="text" 
            value={data.first_name || ""} 
            onChange={(e) => onChange("first_name", e.target.value)}
            placeholder="First Name"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Middle Name</label>
          <input 
            type="text" 
            value={data.middle_name || ""} 
            onChange={(e) => onChange("middle_name", e.target.value)}
            placeholder="Type here"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
          <input 
            type="text" 
            value={data.last_name || ""} 
            onChange={(e) => onChange("last_name", e.target.value)}
            placeholder="Last Name"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Username</label>
          <input 
            type="text" 
            value={data.username || ""} 
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="username"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"} 
              defaultValue=".........."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-16 text-sm font-black tracking-widest text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-primary hover:text-primary-dark transition-colors p-3 min-h-[44px] flex items-center justify-center"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Re-Type Password</label>
          <div className="relative group">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              defaultValue=".........."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-16 text-sm font-black tracking-widest text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-primary hover:text-primary-dark transition-colors p-3 min-h-[44px] flex items-center justify-center"
            >
              {showConfirmPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
