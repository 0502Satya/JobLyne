"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/features/auth/actions";

/**
 * High-fidelity Specialized Sign In for Companies.
 * Features a tabbed interface to switch between roles.
 */
export default function CompanySigninPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        const role = res.role;
        if (role === 'COMPANY') window.location.href = '/company';
        else if (role === 'RECRUITER') window.location.href = '/recruiter/dashboard';
        else window.location.href = '/dashboard';
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setIsPending(false);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-display transition-colors flex flex-col">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-20 py-4 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-primary group">
          <div className="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">JobLyne</h2>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-xs hidden sm:block italic">Don&apos;t have an account?</span>
          <Link href="/auth/signup" className="text-sm font-bold text-primary hover:underline">Register Now</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-2xl transition-all relative z-10">
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Portal Sign In</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm italic">Access your professional workspace</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-sm">error</span>
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                <input 
                  name="email"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 h-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  placeholder="name@company.com" 
                  type="email" 
                  required 
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot Password?</Link>
                </div>
                <input 
                  name="password"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 h-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  placeholder="••••••••" 
                  type="password" 
                  required 
                  disabled={isPending}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" id="remember" />
                <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer italic">Keep me signed in for 30 days</label>
              </div>

              <button disabled={isPending} className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl shadow-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] mt-4" type="submit">
                {isPending ? "Signing In..." : "Sign Into Account"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex gap-6 text-[11px] text-slate-400 font-medium relative z-10 transition-colors">
          <Link href="#" className="hover:text-primary transition-colors cursor-pointer">Contact Support</Link>
          <Link href="#" className="hover:text-primary transition-colors cursor-pointer">Security Overview</Link>
          <Link href="#" className="hover:text-primary transition-colors cursor-pointer">Service Status</Link>
        </div>
      </main>

      <footer className="px-6 md:px-20 py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <p>© 2026 JobLyne Inc. All rights reserved.</p>
        <div className="flex gap-8 italic">
          <Link className="hover:text-primary" href="#">Privacy</Link>
          <Link className="hover:text-primary" href="#">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
