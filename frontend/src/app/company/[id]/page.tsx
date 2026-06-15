"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicCompanyProfileAction } from "@/features/company/actions";

interface JobPost {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  salary_min?: string;
  salary_max?: string;
  currency?: string;
}

interface CompanyProfile {
  name: string;
  description: string;
  website: string;
  logo_url?: string;
  cover_image_url?: string;
  industry: string;
  culture?: string;
  benefits?: string;
  city?: string;
  country?: string;
  verified_badge?: boolean;
}

export default function PublicCompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!companyId) return;
      try {
        const res = await getPublicCompanyProfileAction(companyId);
        if (res.error) {
          setError(res.error);
        } else {
          setProfile(res.profile);
          setJobs(res.jobs || []);
        }
      } catch (err) {
        setError("Failed to resolve corporate details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Fetching Employer Details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">business</span>
        <h2 className="text-2xl font-black mb-2">Workspace Unresolved</h2>
        <p className="text-muted text-sm font-semibold mb-6">{error || "The requested employer workspace does not exist or has been cancelled."}</p>
        <Link href="/" className="px-6 py-3 bg-primary text-surface rounded-2xl font-black text-xs min-h-[44px] flex items-center justify-center">
          Return Home
        </Link>
      </div>
    );
  }

  const logoInitials = profile.name ? profile.name.substring(0, 2).toUpperCase() : "CO";

  return (
    <div className="min-h-screen bg-bg text-text transition-colors flex flex-col font-sans pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hidden md:inline-block">Employer Profile</span>
        </div>
        <Link href="/" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">home</span>
          Talent Home
        </Link>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 space-y-12">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-primary/15 to-[#4c33cf]/10 border border-primary/20 rounded-card p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
            {/* Logo */}
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.name} 
                className="size-20 rounded-3xl object-cover border-2 border-border shadow-md bg-surface shrink-0" 
              />
            ) : (
              <div className="size-20 rounded-3xl bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                {logoInitials}
              </div>
            )}
            
            <div className="space-y-2 max-w-xl overflow-wrap break-word">
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="text-3xl font-black tracking-tight text-text">{profile.name}</h1>
                {profile.verified_badge && (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Vetted Employer
                  </span>
                )}
              </div>
              <p className="text-sm text-muted font-bold tracking-tight uppercase tracking-wider">{profile.industry} &bull; {profile.city || "Remote"}{profile.country ? `, ${profile.country}` : ""}</p>
              
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline mt-1"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                  {profile.website.replace(/^https?:\/\//i, "")}
                </a>
              )}
            </div>
          </div>

          <div className="absolute right-0 top-0 size-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </section>

        {/* Details Grid split */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: About & values */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-surface border border-border p-8 rounded-card shadow-sm space-y-4">
              <h3 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">info</span>
                About the Organization
              </h3>
              <p className="text-muted text-sm font-medium leading-relaxed overflow-wrap break-word">
                {profile.description || "No company bio provided yet."}
              </p>
            </div>

            {profile.culture && (
              <div className="bg-surface border border-border p-8 rounded-card shadow-sm space-y-4">
                <h3 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">palette</span>
                  Culture & Corporate Values
                </h3>
                <p className="text-muted text-sm font-medium leading-relaxed overflow-wrap break-word">
                  {profile.culture}
                </p>
              </div>
            )}

            {profile.benefits && (
              <div className="bg-surface border border-border p-8 rounded-card shadow-sm space-y-4">
                <h3 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                  Perks & Compensation
                </h3>
                <p className="text-muted text-sm font-medium leading-relaxed overflow-wrap break-word">
                  {profile.benefits}
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Open Positions */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">work</span>
              Active Requisitions
            </h3>
            
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-surface border border-border p-6 rounded-2xl hover:border-primary/40 transition-all space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="font-black text-base text-text leading-tight">{job.title}</h4>
                    <p className="text-xs text-muted font-bold tracking-tight">{job.location} &bull; {job.employment_type}</p>
                    {job.salary_min && (
                      <p className="text-xs text-emerald-500 font-extrabold mt-1">
                        Salary: {job.currency || "$"}{Number(job.salary_min).toLocaleString()}
                        {job.salary_max ? ` - ${Number(job.salary_max).toLocaleString()}` : "+"}
                      </p>
                    )}
                  </div>
                  
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="w-full py-3 bg-primary text-surface font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 min-h-[40px] shadow-sm cursor-pointer"
                  >
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="bg-surface border border-border p-8 rounded-card text-center text-muted text-xs font-semibold">
                  No active listings open at this moment. Please subscribe to alerts to stay updated.
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

    </div>
  );
}
