'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function RecruiterError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="justify-center min-h-[400px] mx-auto my-12 border border-border items-center text-center shadow-sm rounded-[24px] max-w-md flex gap-6 p-8 bg-surface flex-col">
      <div className="justify-center h-16 w-16 items-center text-red-500 rounded-full flex bg-red-50 dark:bg-red-950/30">
        <AlertCircle size={30} aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-text type-h2 mb-2">Something went wrong</h3>
        <p className="leading-relaxed type-ui text-text-muted">
          An error occurred while loading the recruiter portal components.
        </p>
      </div>
      <button 
        onClick={reset} 
        className="text-xs px-6 shadow-md uppercase shadow-red-500/20 transition-all py-3 text-white tracking-widest bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
