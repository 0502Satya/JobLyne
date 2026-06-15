"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getRecruiterProfileAction, updateRecruiterProfileAction } from "@/features/auth/actions";

type FormStep = "personal" | "agency";

export default function RecruiterSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<FormStep>("personal");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchProfile() {
      const data = await getRecruiterProfileAction();
      if (data.error) {
        setError(data.error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await updateRecruiterProfileAction(profile);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <div className="size-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Recruiter Profile...</p>
      </div>
    );
  }

  // Calculate completeness score for the sidebar/progress meter
  const getFieldsCompletion = () => {
    if (!profile) return 0;
    let filled = 0;
    const fields = ["first_name", "last_name", "phone", "agency_name"];
    fields.forEach(f => {
      if (profile[f] && profile[f].trim() !== "") filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = getFieldsCompletion();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col box-sizing-border-box overflow-hidden max-w-full pb-20 animate-fade-in">
      
      {/* Settings Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/recruiter/dashboard" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            JobLyne Recruiter
          </Link>
          <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
            Profile Settings
          </span>
        </div>
        <Link 
          href="/recruiter/dashboard" 
          className="text-sm font-black text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl hover:bg-amber-500/5 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Dashboard
        </Link>
      </header>

      <main className="p-6 md:p-12 max-w-5xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Sidebar: Progress and Step Navigation */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              
              {/* Profile Card Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {profile?.profile_photo_url ? (
                    <img 
                      src={profile.profile_photo_url} 
                      alt="Avatar" 
                      className="size-12 rounded-2xl object-cover border border-slate-800"
                    />
                  ) : (
                    <div className="size-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-500/10 shrink-0">
                      {profile?.first_name ? profile.first_name.substring(0, 2).toUpperCase() : "RC"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-100 text-base truncate">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "Recruiter"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium tracking-tight truncate">{profile?.agency_name || "Agency Hub"}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                    <span>Completeness</span>
                    <span className="text-amber-400">{completionPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Wizard Steps Navigation */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: "personal", label: "Personal Profile", icon: "person" },
                  { id: "agency", label: "Agency Details", icon: "business" },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id as FormStep)}
                    className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all min-h-[48px] text-left active:scale-[0.98] ${
                      activeStep === step.id 
                        ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{step.icon}</span>
                    {step.label}
                  </button>
                ))}
              </nav>

            </div>
          </div>

          {/* Right Area: Form Contents */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-100">Recruiter Profile</h1>
              <p className="text-slate-400 text-sm font-semibold mt-1">Manage your identity and hiring agency configurations.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm space-y-8 box-sizing">
              
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold flex gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Recruiter details updated successfully!
                </div>
              )}

              {/* Step 1: Personal Details */}
              {activeStep === "personal" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="material-symbols-outlined text-[28px] font-black">person</span>
                    <h3 className="text-xl font-bold tracking-tight text-slate-100">Personal Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input 
                        name="first_name"
                        required
                        value={profile?.first_name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. Surya"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        name="last_name"
                        required
                        value={profile?.last_name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. Shukla"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email (Read Only)</label>
                      <input 
                        name="email"
                        disabled
                        value={profile?.email || ""}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none font-medium text-sm min-h-[48px] opacity-65 cursor-not-allowed"
                        placeholder="recruiter@agency.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                      <input 
                        name="phone"
                        required
                        value={profile?.phone || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. +1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avatar / Photo URL</label>
                    <input 
                      name="profile_photo_url"
                      type="url"
                      value={profile?.profile_photo_url || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-sm min-h-[48px]"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep("agency")}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center gap-1"
                    >
                      Continue to Agency Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Agency Details */}
              {activeStep === "agency" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="material-symbols-outlined text-[28px] font-black">business</span>
                    <h3 className="text-xl font-bold tracking-tight text-slate-100">Agency Details</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recruiting Agency / Corporate Group</label>
                    <input 
                      name="agency_name"
                      required
                      value={profile?.agency_name || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-sm min-h-[48px]"
                      placeholder="e.g. Dataminerz Sourcing"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("personal")}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all min-h-[48px] flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 py-3.5 rounded-2xl font-bold text-base hover:scale-[1.02] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <div className="size-4 rounded-full border-2 border-slate-950/20 border-t-slate-950 animate-spin"></div>
                          Syncing Profile...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">save</span>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

        </div>
      </main>

    </div>
  );
}
