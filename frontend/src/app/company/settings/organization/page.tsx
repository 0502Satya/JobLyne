"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getCompanyProfileAction, updateCompanyProfileAction, getUserProfileAction, updateUserProfileAction } from "@/features/auth/actions";

type FormStep = "personal" | "general" | "location" | "values";

export default function OrganizationSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<FormStep>("personal");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchProfile() {
      const data = await getCompanyProfileAction();
      const userData = await getUserProfileAction();
      if (data.error || userData.error) {
        setError(data.error || userData.error);
      } else {
        setProfile(data);
        setUserProfile(userData);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await updateCompanyProfileAction(profile);
      const userRes = await updateUserProfileAction(userProfile);
      if (res.error || userRes.error) {
        setError(res.error || userRes.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Syncing Credentials...</p>
      </div>
    );
  }

  // Calculate completeness score for the sidebar/progress meter
  const getFieldsCompletion = () => {
    if (!profile || !userProfile) return 0;
    let filled = 0;
    const companyFields = ["name", "industry", "website", "description", "city", "country", "culture", "benefits"];
    companyFields.forEach(f => {
      if (profile[f] && profile[f].trim() !== "") filled++;
    });
    const userFields = ["first_name", "last_name", "phone"];
    userFields.forEach(f => {
      if (userProfile[f] && userProfile[f].trim() !== "") filled++;
    });
    const totalFields = companyFields.length + userFields.length;
    return Math.round((filled / totalFields) * 100);
  };

  const completionPercent = getFieldsCompletion();

  return (
    <div className="min-h-screen bg-bg text-text transition-colors flex flex-col font-sans pb-20">
      
      {/* Settings Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-6">
          <Link href="/company" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="text-sm font-black text-muted hidden md:inline-block">Profile Setup</span>
        </div>
        <Link 
          href="/company" 
          className="text-sm font-black text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl hover:bg-primary/5 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Dashboard
        </Link>
      </header>

      <main className="p-6 md:p-12 max-w-5xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Sidebar: Progress and Step Navigation */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-surface border border-border p-6 rounded-card shadow-sm space-y-6">
              
              {/* Profile Card Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black shadow-lg shadow-primary/10">
                    {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "CO"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-text text-base truncate">{profile?.name || "Acme Corp"}</h3>
                    <p className="text-xs text-muted font-bold tracking-tight truncate">{profile?.website || "https://company.com"}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black text-muted uppercase">
                    <span>Completeness</span>
                    <span className="text-primary">{completionPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-[#4c33cf] rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Wizard Steps Navigation */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: "personal", label: "Personal Details", icon: "person" },
                  { id: "general", label: "General Information", icon: "info" },
                  { id: "location", label: "HQ Coordinates", icon: "location_on" },
                  { id: "values", label: "Culture & Perks", icon: "palette" },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id as FormStep)}
                    className={`w-full py-3.5 px-4 rounded-2xl text-sm font-black flex items-center gap-3 transition-all min-h-[48px] text-left active:scale-[0.98] ${
                      activeStep === step.id 
                        ? "bg-primary text-surface shadow-lg shadow-primary/15" 
                        : "text-muted hover:text-text hover:bg-bg"
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
              <h1 className="text-3xl font-black tracking-tight">Organization Profile</h1>
              <p className="text-muted text-sm font-semibold mt-1">Provide developers with a complete, transparent view of your team and work environment.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-card p-6 md:p-10 shadow-sm space-y-8 box-sizing">
              
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-black flex gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-black flex gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Organization details updated successfully!
                </div>
              )}

              {/* Step 0: Personal Details */}
              {activeStep === "personal" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[28px] font-black">person</span>
                    <h3 className="text-xl font-black tracking-tight text-text">Personal Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">First Name</label>
                      <input 
                        name="first_name"
                        required
                        value={userProfile?.first_name || ""}
                        onChange={handleUserChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. John"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Last Name</label>
                      <input 
                        name="last_name"
                        required
                        value={userProfile?.last_name || ""}
                        onChange={handleUserChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Email (Read Only)</label>
                      <input 
                        name="email"
                        disabled
                        value={userProfile?.email || ""}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl outline-none font-medium text-sm min-h-[48px] opacity-65 cursor-not-allowed"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Phone Number</label>
                      <input 
                        name="phone"
                        required
                        value={userProfile?.phone || ""}
                        onChange={handleUserChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. +1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-muted uppercase tracking-wider">Avatar / Photo URL</label>
                    <input 
                      name="profile_photo_url"
                      type="url"
                      value={userProfile?.profile_photo_url || ""}
                      onChange={handleUserChange}
                      className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep("general")}
                      className="w-full bg-primary text-surface py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center gap-1"
                    >
                      Continue to General Information <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: General Info */}
              {activeStep === "general" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[28px] font-black">info</span>
                    <h3 className="text-xl font-black tracking-tight text-text">General Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Company Name</label>
                      <input 
                        name="name"
                        required
                        value={profile?.name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Industry Sector</label>
                      <input 
                        name="industry"
                        required
                        value={profile?.industry || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. Tech / Web3 / Fintech"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-muted uppercase tracking-wider">Website URL</label>
                    <input 
                      name="website"
                      required
                      type="url"
                      value={profile?.website || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Short Bio / Overview</label>
                      <span className="text-[10px] font-black text-muted">
                        {(profile?.description || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="description"
                      required
                      maxLength={500}
                      value={profile?.description || ""}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm resize-none"
                      placeholder="We are building the future of decentralized collaboration platforms..."
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("personal")}
                      className="flex-1 bg-bg hover:bg-border text-text py-3.5 rounded-2xl font-black text-sm transition-all min-h-[48px] flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep("location")}
                      className="flex-1 bg-primary text-surface py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all min-h-[48px] flex items-center justify-center gap-1"
                    >
                      Continue to Headquarters <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {activeStep === "location" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[28px] font-black">location_on</span>
                    <h3 className="text-xl font-black tracking-tight text-text">Headquarters Coordinates</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">City</label>
                      <input 
                        name="city"
                        required
                        value={profile?.city || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. San Francisco"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Country</label>
                      <input 
                        name="country"
                        required
                        value={profile?.country || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm min-h-[48px]"
                        placeholder="e.g. United States"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("general")}
                      className="flex-1 bg-bg hover:bg-border text-text py-3.5 rounded-2xl font-black text-sm transition-all min-h-[48px] flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep("values")}
                      className="flex-1 bg-primary text-surface py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all min-h-[48px] flex items-center justify-center gap-1"
                    >
                      Continue to Culture <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Culture and Perks */}
              {activeStep === "values" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[28px] font-black">palette</span>
                    <h3 className="text-xl font-black tracking-tight text-text">Culture & Perks</h3>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Workspace Culture & Values</label>
                      <span className="text-[10px] font-black text-muted">
                        {(profile?.culture || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="culture"
                      maxLength={500}
                      value={profile?.culture || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm resize-none"
                      placeholder="We operate on a remote-first basis with quarterly physical meetups, high trust, and async workflows..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-muted uppercase tracking-wider">Perks & Compensation Perks</label>
                      <span className="text-[10px] font-black text-muted">
                        {(profile?.benefits || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="benefits"
                      maxLength={500}
                      value={profile?.benefits || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3.5 bg-bg border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm resize-none"
                      placeholder="Unlimited PTO, medical coverage, annual software/hardware budget, co-working stipends..."
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("location")}
                      className="bg-bg hover:bg-border text-text py-3.5 px-6 rounded-2xl font-black text-sm transition-all min-h-[48px] flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="flex-1 bg-gradient-to-r from-primary to-[#4c33cf] text-surface py-3.5 rounded-2xl font-black text-base hover:scale-[1.02] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <div className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                          Syncing Workspace...
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

