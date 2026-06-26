import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getPublicCompanyProfileAction } from "@/features/company/actions";
import CompanyProfilePageClient from "./CompanyProfilePageClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await getPublicCompanyProfileAction(resolvedParams.id);
    if (res && !res.error && res.profile) {
      return {
        title: `${res.profile.name} | JobLyne`,
        description: res.profile.description || `Learn more about careers and opportunities at ${res.profile.name}.`,
      };
    }
  } catch (err) {
    // Fallback
  }
  return {
    title: "Company Profile | JobLyne",
    description: "View open jobs and company profile details on JobLyne.",
  };
}

export default async function PublicCompanyProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const companyId = resolvedParams.id;

  let profile = null;
  let jobs = [];
  let error = null;

  try {
    const res = await getPublicCompanyProfileAction(companyId);
    if (res.error) {
      error = res.error;
    } else {
      profile = res.profile;
      jobs = res.jobs || [];
    }
  } catch (err) {
    error = "Failed to resolve corporate details.";
  }

  if (error || !profile) {
    return (
      <div className="text-text justify-center mx-auto items-center bg-bg text-center p-6 max-w-md flex min-h-screen flex-col">
        <Building2 className="text-error mb-4" size={60} aria-hidden="true" />
        <h2 className="mb-2 type-h2">Workspace Unresolved</h2>
        <p className="mb-6 type-label">{error || "The requested employer workspace does not exist or has been cancelled."}</p>
        <Link href="/" className="justify-center type-badge px-6 rounded-2xl min-h-[44px] items-center py-3 bg-primary flex text-white">
          Return Home
        </Link>
      </div>
    );
  }

  return <CompanyProfilePageClient profile={profile} jobs={jobs} />;
}
