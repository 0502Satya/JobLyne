"use client";

import React from "react";
import Link from "next/link";

interface ProfileHeaderProps {
  onSave: () => void;
  onDiscard: () => void;
  isDark: boolean;
  toggleDark: () => void;
}

export default function ProfileHeader({ onSave, onDiscard, isDark, toggleDark }: ProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">hub</span>
          <h2 className="font-extrabold text-slate-900 dark:text-white hidden sm:block">JobLyne</h2>
        </div>
      </div>
      
      <h1 className="text-base font-bold text-slate-700 dark:text-slate-300 hidden md:block">Edit Profile</h1>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleDark}
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined text-xl">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
        
        <button 
          onClick={onDiscard}
          className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
        >
          Discard
        </button>
        
        <button 
          onClick={onSave}
          className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">save</span> Save Changes
        </button>
      </div>
    </header>
  );
}
