"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { adminLoginAction } from "@/features/admin/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLoginAction({ email, password });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Welcome back, Administrator!");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans text-left">
      <Toaster position="top-right" />
      
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-900/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-md p-8 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl relative z-10 space-y-8 flex flex-col justify-center">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-primary/10 border border-primary/25 rounded-2xl text-primary inline-flex">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">JobLyne Controls</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Administrative Login</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@joblyne.com"
                className="w-full h-11 pl-11 pr-4 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary text-sm transition-all focus:ring-1 focus:ring-primary/25"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-11 pr-4 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary text-sm transition-all focus:ring-1 focus:ring-primary/25"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-transform duration-100 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating secure session...</span>
                </>
              ) : (
                <>
                  <span>Initialize Admin Session</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Notice Info block */}
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl text-[10px] text-slate-500 leading-relaxed text-center">
          ⚠ Secure administrative segment. System audit logging is active. Unauthorized access attempts will be flagged.
        </div>

      </div>
    </div>
  );
}
