"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getCompanyProfileAction, updateCompanyProfileAction, getUserProfileAction, updateUserProfileAction } from "@/features/auth/actions";
import { Input } from "@/shared/ui";
import { 
  AlertCircle, 
  Network, 
  ArrowLeft, 
  User, 
  Info, 
  MapPin, 
  Palette, 
  Check, 
  CheckCircle, 
  ArrowRight, 
  Save, 
  Loader2 
} from "lucide-react";

type FormStep = "personal" | "general" | "location" | "values";

export default function OrganizationSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<FormStep>("personal");
  const [isPending, startTransition] = useTransition();

  const fetchProfile = async () => {
    setLoading(true);
    setFetchError(null);
    setError(null);
    
    let resolved = false;

    // 10-second timeout check
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        setFetchError("Loading took too long. Please verify your connection.");
        setLoading(false);
      }
    }, 10000);

    try {
      const data = await getCompanyProfileAction();
      const userData = await getUserProfileAction();
      resolved = true;
      clearTimeout(timeoutId);

      if (data.error || userData.error) {
        setFetchError(data.error || userData.error);
      } else {
        setProfile(data);
        setUserProfile(userData);
      }
    } catch (err) {
      resolved = true;
      clearTimeout(timeoutId);
      setFetchError("An error occurred while loading settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <div className="text-text justify-center gap-4 items-center bg-bg flex min-h-screen flex-col">
        <div className="border-t-primary size-12 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="type-label uppercase tracking-widest">Loading settings...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-text justify-center gap-4 items-center bg-bg flex min-h-screen flex-col p-6 text-center">
        <AlertCircle className="text-error" size={48} aria-hidden="true" />
        <h3 className="type-h3 text-text">Failed to Load Settings</h3>
        <p className="text-muted max-w-md">{fetchError}</p>
        <button 
          onClick={fetchProfile}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-95 transition-all cursor-pointer mt-2"
        >
          Retry
        </button>
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
    <div className="text-text bg-bg pb-20 transition-colors flex min-h-screen flex-col">
      
      {/* Settings Header */}
      <header className="border-b border-border px-6 py-4 items-center transition-all sticky z-50 flex top-0 bg-surface justify-between md:px-12">
        <div className="flex gap-6 items-center">
          <Link href="/company" className="text-primary items-center gap-2 flex transition-opacity hover:opacity-90">
            <Network size={30} aria-hidden="true" />
            <span className="text-2xl tracking-tight font-bold">JobLyne</span>
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <span className="type-ui hidden text-muted md:inline-block">Profile Setup</span>
        </div>
        <Link 
          href="/company" 
          className="text-primary gap-1.5 min-h-[44px] items-center type-ui transition-colors flex px-4 rounded-xl hover:bg-primary/5 hover:text-primary-dark active:scale-[0.98]"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Dashboard
        </Link>
      </header>

      <main className="w-full mx-auto flex-1 max-w-5xl p-6 md:p-12">
        <div className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Sidebar: Progress and Step Navigation */}
          <div className="space-y-6 lg:top-28 lg:sticky">
            <div className="rounded-card border-border space-y-6 shadow-sm p-6 bg-surface border">
              
              {/* Profile Card Summary */}
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="justify-center rounded-2xl bg-gradient-to-tr size-12 items-center from-primary text-white shadow-primary/10 shadow-lg to-[#4c33cf] flex font-semibold">
                    {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "CO"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-text truncate text-base font-semibold">{profile?.name || "Acme Corp"}</h3>
                    <p className="tracking-tight truncate type-caption text-muted">{profile?.website || "https://company.com"}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="type-badge items-center flex justify-between">
                    <span>Completeness</span>
                    <span className="text-primary">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-bg rounded-full">
                    <div 
                      className="bg-gradient-to-r h-full transition-all from-primary rounded-full duration-500 to-[#4c33cf]"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Wizard Steps Navigation */}
              <nav className="flex gap-1.5 flex-col">
                {[
                  { id: "personal", label: "Personal Details", icon: User },
                  { id: "general", label: "General Information", icon: Info },
                  { id: "location", label: "HQ Coordinates", icon: MapPin },
                  { id: "values", label: "Culture & Perks", icon: Palette },
                ].map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id as FormStep)}
                      className={`w-full min-h-[48px] rounded-2xl py-3.5 items-center transition-all type-ui gap-3 flex px-4 text-left active:scale-[0.98] cursor-pointer ${
                        activeStep === step.id 
                          ? "bg-primary shadow-lg shadow-primary/15 text-white font-semibold" 
                          : "text-muted hover:bg-bg hover:text-text"
                      }`}
                    >
                      <StepIcon size={18} aria-hidden="true" />
                      {step.label}
                    </button>
                  );
                })}
              </nav>

            </div>
          </div>

          {/* Right Area: Form Contents */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Page Header with Step Counter */}
            <div>
              <div className="flex justify-between items-end">
                <h1 className="type-h1">Organization Profile</h1>
                <span className="type-badge text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg font-bold">
                  Step {activeStep === "personal" ? 1 : activeStep === "general" ? 2 : activeStep === "location" ? 3 : 4} of 4
                </span>
              </div>
              <p className="mt-1 type-label">Provide developers with a complete, transparent view of your team and work environment.</p>
            </div>

            {/* Horizontal Step Stepper */}
            <div className="bg-surface border border-border rounded-2xl p-4 flex justify-between items-center w-full shadow-sm">
              {[
                { id: "personal", stepNum: 1, label: "Personal" },
                { id: "general", stepNum: 2, label: "General" },
                { id: "location", stepNum: 3, label: "HQ" },
                { id: "values", stepNum: 4, label: "Culture" },
              ].map((step, idx, arr) => {
                const stepOrder = ["personal", "general", "location", "values"];
                const activeIdx = stepOrder.indexOf(activeStep);
                const currentIdx = stepOrder.indexOf(step.id);
                const isCompleted = currentIdx < activeIdx;
                const isActive = currentIdx === activeIdx;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id as FormStep)}
                      className="flex items-center gap-2 group focus:outline-none cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isCompleted ? "bg-success text-white" :
                        isActive ? "bg-primary text-white ring-4 ring-primary/20" :
                        "bg-bg text-muted group-hover:bg-border/60"
                      }`}>
                        {isCompleted ? (
                          <Check size={14} aria-hidden="true" />
                        ) : step.stepNum}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:inline transition-colors ${
                        isActive ? "text-primary font-bold" : "text-muted group-hover:text-text"
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                        currentIdx < activeIdx ? "bg-success" : "bg-bg"
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="rounded-card space-y-8 box-sizing border-border shadow-sm p-6 bg-surface border md:p-10">
              
              {/* Error Alert */}
              {error && (
                <div className="slide-in-from-top-2 text-error rounded-xl bg-error-bg animate-in border-error/20 gap-3 type-ui flex p-4 border items-center">
                  <AlertCircle className="shrink-0" size={20} aria-hidden="true" />
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="slide-in-from-top-2 rounded-xl bg-success-bg border-success/20 text-success gap-3 animate-in type-ui flex p-4 border items-center">
                  <CheckCircle className="shrink-0" size={20} aria-hidden="true" />
                  Organization details updated successfully!
                </div>
              )}

              {/* Step 0: Personal Details */}
              {activeStep === "personal" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <User className="text-primary" size={24} aria-hidden="true" />
                    <h3 className="text-text type-h2">Personal Details</h3>
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <Input 
                      label="First Name"
                      name="first_name"
                      required
                      value={userProfile?.first_name || ""}
                      onChange={handleUserChange}
                      placeholder="e.g. John"
                    />
                    <Input 
                      label="Last Name"
                      name="last_name"
                      required
                      value={userProfile?.last_name || ""}
                      onChange={handleUserChange}
                      placeholder="e.g. Doe"
                    />
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <Input 
                      label="Email (Read Only)"
                      name="email"
                      disabled
                      value={userProfile?.email || ""}
                      placeholder="john.doe@company.com"
                    />
                    <Input 
                      label="Phone Number"
                      name="phone"
                      required
                      value={userProfile?.phone || ""}
                      onChange={handleUserChange}
                      placeholder="e.g. +1 (555) 123-4567"
                    />
                  </div>

                  <Input 
                    label="Avatar / Photo URL"
                    name="profile_photo_url"
                    type="url"
                    value={userProfile?.profile_photo_url || ""}
                    onChange={handleUserChange}
                    placeholder="https://example.com/avatar.jpg"
                  />

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep("general")}
                      className="w-full justify-center min-h-[44px] gap-1 rounded-xl py-3 items-center transition-all type-ui shadow-lg shadow-primary/20 bg-primary flex text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-semibold"
                    >
                      Continue to General Information <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: General Info */}
              {activeStep === "general" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <Info className="text-primary" size={24} aria-hidden="true" />
                    <h3 className="text-text type-h2">General Information</h3>
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <Input 
                      label="Company Name"
                      name="name"
                      required
                      value={profile?.name || ""}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corp"
                    />
                    <Input 
                      label="Industry Sector"
                      name="industry"
                      required
                      value={profile?.industry || ""}
                      onChange={handleChange}
                      placeholder="e.g. Tech / Web3 / Fintech"
                    />
                  </div>

                  <Input 
                    label="Website URL"
                    name="website"
                    required
                    type="url"
                    value={profile?.website || ""}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-text type-ui block font-medium" htmlFor="description">Short Bio / Overview</label>
                      <span className="text-xs text-muted">
                        {(profile?.description || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="description"
                      id="description"
                      required
                      maxLength={500}
                      value={profile?.description || ""}
                      onChange={handleChange}
                      rows={5}
                      className="w-full outline-none border-input-border rounded-xl resize-none py-3 px-4 bg-input-bg transition-all type-ui border focus:ring-2 focus:border-primary focus:ring-primary leading-relaxed"
                      placeholder="We are building the future of decentralized collaboration platforms..."
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep("personal")}
                      className="text-text justify-center flex-1 min-h-[44px] gap-1 rounded-xl py-3 items-center bg-bg transition-all type-ui flex hover:bg-border active:scale-[0.98] cursor-pointer"
                    >
                      <ArrowLeft size={14} aria-hidden="true" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep("location")}
                      className="justify-center flex-1 min-h-[44px] gap-1 rounded-xl py-3 items-center transition-all type-ui shadow-lg shadow-primary/20 bg-primary flex text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-semibold"
                    >
                      Continue to Headquarters <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {activeStep === "location" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <MapPin className="text-primary" size={24} aria-hidden="true" />
                    <h3 className="text-text type-h2">Headquarters Coordinates</h3>
                  </div>

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <Input 
                      label="City"
                      name="city"
                      required
                      value={profile?.city || ""}
                      onChange={handleChange}
                      placeholder="e.g. San Francisco"
                    />
                    <Input 
                      label="Country"
                      name="country"
                      required
                      value={profile?.country || ""}
                      onChange={handleChange}
                      placeholder="e.g. United States"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep("general")}
                      className="text-text justify-center flex-1 min-h-[44px] gap-1 rounded-xl py-3 items-center bg-bg transition-all type-ui flex hover:bg-border active:scale-[0.98] cursor-pointer"
                    >
                      <ArrowLeft size={14} aria-hidden="true" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep("values")}
                      className="justify-center flex-1 min-h-[44px] gap-1 rounded-xl py-3 items-center transition-all type-ui shadow-lg shadow-primary/20 bg-primary flex text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-semibold"
                    >
                      Continue to Culture <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Culture and Perks */}
              {activeStep === "values" && (
                <div className="fade-in animate-in space-y-6 duration-200">
                  <div className="gap-2 flex text-primary items-center">
                    <Palette className="text-primary" size={24} aria-hidden="true" />
                    <h3 className="text-text type-h2">Culture & Perks</h3>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-text type-ui block font-medium" htmlFor="culture">Workspace Culture & Values</label>
                      <span className="text-xs text-muted">
                        {(profile?.culture || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="culture"
                      id="culture"
                      maxLength={500}
                      value={profile?.culture || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full outline-none border-input-border rounded-xl resize-none py-3 px-4 bg-input-bg transition-all type-ui border focus:ring-2 focus:border-primary focus:ring-primary leading-relaxed"
                      placeholder="We operate on a remote-first basis with quarterly physical meetups, high trust, and async workflows..."
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-text type-ui block font-medium" htmlFor="benefits">Perks & Compensation Perks</label>
                      <span className="text-xs text-muted">
                        {(profile?.benefits || "").length} / 500
                      </span>
                    </div>
                    <textarea 
                      name="benefits"
                      id="benefits"
                      maxLength={500}
                      value={profile?.benefits || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full outline-none border-input-border rounded-xl resize-none py-3 px-4 bg-input-bg transition-all type-ui border focus:ring-2 focus:border-primary focus:ring-primary leading-relaxed"
                      placeholder="Unlimited PTO, medical coverage, annual software/hardware budget, co-working stipends..."
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep("location")}
                      className="text-text justify-center min-h-[44px] px-6 gap-1 rounded-xl py-3 items-center bg-bg transition-all type-ui flex hover:bg-border active:scale-[0.98] cursor-pointer"
                    >
                      <ArrowLeft size={14} aria-hidden="true" /> Back
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="relative bg-gradient-to-r justify-center flex-1 min-h-[44px] rounded-xl py-3 text-base transition-all from-primary shadow-primary/20 items-center gap-2 shadow-xl to-[#4c33cf] flex text-white hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-semibold"
                    >
                      <span className="flex items-center gap-2">
                        <Save size={18} aria-hidden="true" />
                        <span>Save Changes</span>
                      </span>
                      {isPending && (
                        <span className="absolute right-4 flex items-center">
                          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                        </span>
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
