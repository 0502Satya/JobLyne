"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicCompanyProfileAction } from "@/features/company/actions";
import { 
  Building2, 
  Network, 
  Home, 
  BadgeCheck, 
  Link as LinkIcon, 
  Info, 
  Palette, 
  Crown, 
  Briefcase, 
  ArrowRight 
} from "lucide-react";

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
      <div className="text-text justify-center gap-4 items-center bg-bg flex min-h-screen flex-col">
        <div className="border-t-primary size-12 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="type-label uppercase tracking-widest">Fetching Employer Details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-text justify-center mx-auto items-center bg-bg text-center p-6 max-w-md flex min-h-screen flex-col">
        <Building2 className="text-red-500 mb-4" size={60} aria-hidden="true" />
        <h2 className="mb-2 type-h2">Workspace Unresolved</h2>
        <p className="mb-6 type-label">{error || "The requested employer workspace does not exist or has been cancelled."}</p>
        <Link href="/" className="justify-center type-badge px-6 rounded-2xl min-h-[44px] items-center py-3 bg-primary flex text-white">
          Return Home
        </Link>
      </div>
    );
  }

  const logoInitials = profile.name ? profile.name.substring(0, 2).toUpperCase() : "CO";

  return (
    <div className="text-text bg-bg pb-20 transition-colors flex min-h-screen flex-col">
      
      {/* Header */}
      <header className="border-b border-border px-6 py-4 items-center sticky z-40 flex top-0 bg-surface justify-between md:px-12">
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-primary items-center gap-2 flex transition-opacity hover:opacity-90">
            <Network size={30} aria-hidden="true" />
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <span className="text-primary px-3 hidden py-1.5 rounded-full type-badge bg-primary/10 md:inline-block">Employer Profile</span>
        </div>
        <Link href="/" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
          <Home size={18} aria-hidden="true" />
          Talent Home
        </Link>
      </header>

      {/* Main Content Layout */}
      <main className="w-full py-12 mx-auto space-y-12 px-6 max-w-5xl">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-r rounded-card gap-8 relative border-primary/20 from-primary/15 items-center to-[#4c33cf]/10 overflow-hidden shadow-sm flex-col flex justify-between p-8 border md:items-start md:p-12 md:flex-row">
          
          <div className="z-10 relative items-center text-center flex gap-6 flex-col md:items-start md:flex-row md:text-left">
            {/* Logo */}
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.name} 
                className="shrink-0 object-cover border-border shadow-md rounded-3xl border-2 bg-surface size-20" 
              />
            ) : (
              <div className="justify-center shrink-0 type-h2 rounded-3xl bg-gradient-to-tr items-center from-primary text-white shadow-lg to-[#4c33cf] flex size-20">
                {logoInitials}
              </div>
            )}
            
            <div className="max-w-xl break-word space-y-2 overflow-wrap">
              <div className="justify-center items-center flex-wrap gap-3 flex md:justify-start">
                <h1 className="text-text type-h1">{profile.name}</h1>
                {profile.verified_badge && (
                  <span className="py-1 gap-1 uppercase text-xs text-emerald-500 items-center px-2.5 bg-emerald-500/10 tracking-widest rounded-full border-emerald-500/20 flex border">
                    <BadgeCheck size={12} aria-hidden="true" />
                    Vetted Employer
                  </span>
                )}
              </div>
              <p className="tracking-tight type-label uppercase tracking-wider">{profile.industry} &bull; {profile.city || "Remote"}{profile.country ? `, ${profile.country}` : ""}</p>
              
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary gap-1.5 mt-1 inline-flex items-center type-badge hover:underline"
                >
                  <LinkIcon size={16} aria-hidden="true" />
                  {profile.website.replace(/^https?:\/\//i, "")}
                </a>
              )}
            </div>
          </div>

          <div className="blur-3xl size-72 translate-x-1/3 absolute bg-primary/5 rounded-full -translate-y-1/2 right-0 top-0"></div>
        </section>

        {/* Details Grid split */}
        <section className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: About & values */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="rounded-card border-border shadow-sm p-8 space-y-4 bg-surface border">
              <h3 className="text-text type-h2 items-center gap-2 flex">
                <Info className="text-primary" size={20} aria-hidden="true" />
                About the Organization
              </h3>
              <p className="break-word type-label leading-relaxed overflow-wrap">
                {profile.description || "No company bio provided yet."}
              </p>
            </div>

            {profile.culture && (
              <div className="rounded-card border-border shadow-sm p-8 space-y-4 bg-surface border">
                <h3 className="text-text type-h2 items-center gap-2 flex">
                  <Palette className="text-primary" size={20} aria-hidden="true" />
                  Culture & Corporate Values
                </h3>
                <p className="break-word type-label leading-relaxed overflow-wrap">
                  {profile.culture}
                </p>
              </div>
            )}

            {profile.benefits && (
              <div className="rounded-card border-border shadow-sm p-8 space-y-4 bg-surface border">
                <h3 className="text-text type-h2 items-center gap-2 flex">
                  <Crown className="text-primary" size={20} aria-hidden="true" />
                  Perks & Compensation
                </h3>
                <p className="break-word type-label leading-relaxed overflow-wrap">
                  {profile.benefits}
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Open Positions */}
          <div className="space-y-6 lg:top-28 lg:sticky">
            <h3 className="type-h2 items-center gap-2 flex">
              <Briefcase className="text-primary" size={20} aria-hidden="true" />
              Active Requisitions
            </h3>
            
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border-border rounded-2xl transition-all shadow-sm p-6 space-y-4 bg-surface border hover:border-primary/40">
                  <div className="space-y-1">
                    <h4 className="text-text leading-tight text-base">{job.title}</h4>
                    <p className="tracking-tight type-caption text-muted">{job.location} &bull; {job.employment_type}</p>
                    {job.salary_min && (
                      <p className="weight-display mt-1 text-xs text-emerald-500">
                        Salary: {job.currency || "$"}{Number(job.salary_min).toLocaleString()}
                        {job.salary_max ? ` - ${Number(job.salary_max).toLocaleString()}` : "+"}
                      </p>
                    )}
                  </div>
                  
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="w-full min-h-[40px] justify-center type-badge cursor-pointer gap-1.5 items-center transition-all py-3 shadow-sm bg-primary flex text-white rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    View Details
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="type-caption rounded-card border-border text-center text-muted p-8 bg-surface border">
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
