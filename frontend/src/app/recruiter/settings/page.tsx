"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getRecruiterProfileAction, updateRecruiterProfileAction } from "@/features/auth/actions";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  User,
  ArrowRight,
  Building2,
  Save
} from "lucide-react";
import { Icon } from "@/shared/ui";

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
      <div className="justify-center gap-4 items-center text-muted flex bg-surface min-h-screen flex-col">
        <div className="border-primary/20 border-t-primary size-12 rounded-full border-4 animate-spin"></div>
        <p className="text-muted uppercase type-ui tracking-widest">Fetching Recruiter Profile...</p>
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
    <div className="max-w-full box-sizing-border-box animate-fade-in overflow-hidden pb-20 text-muted flex bg-surface min-h-screen flex-col">
      
      {/* Settings Header */}
      <header className="border-b px-6 py-4 items-center backdrop-blur-md bg-card/60 sticky z-50 flex top-0 border-border justify-between">
        <div className="flex gap-3 items-center">
          <Link href="/recruiter/dashboard" className="bg-gradient-primary type-h3 text-transparent bg-clip-text">
            JobLyne Recruiter
          </Link>
          <span className="px-2 bg-primary/10 border-primary/20 text-primary rounded-full py-0.5 type-caption border">
            Profile Settings
          </span>
        </div>
        <Link 
          href="/recruiter/dashboard" 
          className="gap-1.5 min-h-[44px] text-primary items-center type-ui transition-colors flex px-4 rounded-xl hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Dashboard
        </Link>
      </header>

      <main className="w-full mx-auto flex-1 max-w-5xl p-6 md:p-12">
        <div className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Sidebar: Progress and Step Navigation */}
          <div className="space-y-6 lg:top-28 lg:sticky">
            <div className="rounded-3xl bg-card/40 space-y-6 shadow-sm p-6 border-border border">
              
              {/* Profile Card Summary */}
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  {profile?.profile_photo_url ? (
                    <img 
                      src={profile.profile_photo_url} 
                      alt="Avatar" 
                      className="object-cover rounded-2xl size-12 border-border border"
                    />
                  ) : (
                    <div className="justify-center shrink-0 rounded-2xl bg-gradient-primary shadow-primary/10 size-12 items-center text-white shadow-lg flex">
                      {profile?.first_name ? profile.first_name.substring(0, 2).toUpperCase() : "RC"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-muted truncate type-card-title">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "Recruiter"}
                    </h3>
                    <p className="tracking-tight text-muted truncate type-caption">{profile?.agency_name || "Agency Hub"}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-muted uppercase items-center flex type-caption justify-between">
                    <span>Completeness</span>
                    <span className="text-primary">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden border-border rounded-full bg-surface border">
                    <div 
                      className="bg-gradient-primary h-full transition-all rounded-full duration-500"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Wizard Steps Navigation */}
              <nav className="flex gap-1.5 flex-col">
                {[
                  { id: "personal", label: "Personal Profile", icon: "person" },
                  { id: "agency", label: "Agency Details", icon: "business" },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id as FormStep)}
                    className={`w-full min-h-[48px] rounded-2xl py-3.5 items-center transition-all type-ui gap-3 flex px-4 text-left active:scale-[0.98] ${
                      activeStep === step.id 
                        ? "bg-primary text-white shadow-lg shadow-primary/15" 
                        : "text-muted hover:bg-card/40 hover:text-muted"
                    }`}
                  >
                    <Icon name={step.icon} size={18} aria-hidden="true" />
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
              <h1 className="text-muted type-h1">Recruiter Profile</h1>
              <p className="type-ui text-muted mt-1">Manage your identity and hiring agency configurations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 box-sizing rounded-3xl bg-card/40 shadow-sm p-6 border-border border md:p-10">
              
              {/* Error Alert */}
              {error && (
                <div className="slide-in-from-top-2 rounded-2xl text-error animate-in gap-3 border-error/20 type-ui flex p-4 bg-error-bg border">
                  <AlertCircle size={20} aria-hidden="true" />
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="slide-in-from-top-2 rounded-2xl text-success animate-in gap-3 bg-success-bg type-ui border-success/20 flex p-4 border">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  Recruiter details updated successfully!
                </div>
              )}

              {/* Step 1: Personal Details */}
              {activeStep === "personal" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <User size={24} aria-hidden="true" />
                    <h3 className="text-muted tracking-tight type-h3">Personal Profile</h3>
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-muted uppercase tracking-wider type-caption">First name</label>
                      <input 
                        name="first_name"
                        required
                        value={profile?.first_name || ""}
                        onChange={handleChange}
                        className="w-full outline-none min-h-[48px] rounded-2xl py-3.5 transition-all type-ui bg-surface px-4 border-border border focus:ring-primary focus:ring-2"
                        placeholder="e.g. Surya"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-muted uppercase tracking-wider type-caption">Last name</label>
                      <input 
                        name="last_name"
                        required
                        value={profile?.last_name || ""}
                        onChange={handleChange}
                        className="w-full outline-none min-h-[48px] rounded-2xl py-3.5 transition-all type-ui bg-surface px-4 border-border border focus:ring-primary focus:ring-2"
                        placeholder="e.g. Shukla"
                      />
                    </div>
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-muted uppercase tracking-wider type-caption">Email (Read Only)</label>
                      <input 
                        name="email"
                        disabled
                        value={profile?.email || ""}
                        className="w-full outline-none opacity-65 min-h-[48px] rounded-2xl py-3.5 cursor-not-allowed type-ui bg-surface px-4 border-border border"
                        placeholder="recruiter@agency.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-muted uppercase tracking-wider type-caption">Phone Number</label>
                      <input 
                        name="phone"
                        required
                        value={profile?.phone || ""}
                        onChange={handleChange}
                        className="w-full outline-none min-h-[48px] rounded-2xl py-3.5 transition-all type-ui bg-surface px-4 border-border border focus:ring-primary focus:ring-2"
                        placeholder="e.g. +1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider type-caption">Avatar / Photo URL</label>
                    <input 
                      name="profile_photo_url"
                      type="url"
                      value={profile?.profile_photo_url || ""}
                      onChange={handleChange}
                      className="w-full outline-none min-h-[48px] rounded-2xl py-3.5 transition-all type-ui bg-surface px-4 border-border border focus:ring-primary focus:ring-2"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep("agency")}
                      className="w-full bg-primary justify-center text-white shadow-primary/20 min-h-[48px] gap-1 rounded-2xl py-3.5 items-center transition-all type-ui flex shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue to Agency Details <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Agency Details */}
              {activeStep === "agency" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <Building2 size={24} aria-hidden="true" />
                    <h3 className="text-muted tracking-tight type-h3">Agency Details</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider type-caption">Recruiting Agency / Corporate Group</label>
                    <input 
                      name="agency_name"
                      required
                      value={profile?.agency_name || ""}
                      onChange={handleChange}
                      className="w-full outline-none min-h-[48px] rounded-2xl py-3.5 transition-all type-ui bg-surface px-4 border-border border focus:ring-primary focus:ring-2"
                      placeholder="e.g. Dataminerz Sourcing"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep("personal")}
                      className="justify-center min-h-[48px] px-6 gap-1 rounded-2xl py-3.5 items-center transition-all type-ui text-muted flex bg-surface border-border border hover:bg-card active:scale-[0.98]"
                    >
                      <ArrowLeft size={14} aria-hidden="true" /> Back
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="bg-gradient-primary text-white flex-1 shadow-primary/20 min-h-[48px] justify-center rounded-2xl type-card-title py-3.5 transition-all items-center gap-2 shadow-xl flex hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <div className="size-4 border-t-slate-950 border-border/20 border-2 rounded-full animate-spin"></div>
                          Syncing Profile...
                        </>
                      ) : (
                        <>
                          <Save size={18} aria-hidden="true" />
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
