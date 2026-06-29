import React from "react";
import { redirect } from "next/navigation";
import { getSavedJobs } from "@/services/jobs.server";
import SavedJobsPageClient from "@/features/dashboard/components/saved-jobs/SavedJobsPageClient";

export default async function SavedJobsPage() {
  let jobs = [];

  try {
    jobs = await getSavedJobs();
  } catch (error) {
    redirect("/auth/signin");
  }

  return <SavedJobsPageClient initialJobs={jobs} />;
}
