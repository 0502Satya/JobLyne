'use client';

import React from 'react';

export default function DashboardError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center p-8 bg-surface rounded-[24px] border border-border shadow-sm max-w-md mx-auto my-12">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <div>
        <h3 className="text-xl font-black text-text tracking-tight mb-2">Something went wrong</h3>
        <p className="text-sm font-bold text-text-muted leading-relaxed">
          An error occurred while loading the dashboard components.
        </p>
      </div>
      <button 
        onClick={reset} 
        className="px-6 py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-500/20"
      >
        Try again
      </button>
    </div>
  );
}
