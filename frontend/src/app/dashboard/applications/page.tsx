import React from "react";
import { redirect } from "next/navigation";
import { getApplications } from "@/services/jobs.server";
import ApplicationsPageClient from "@/features/dashboard/components/applications/ApplicationsPageClient";

export default async function ApplicationsPage() {
  let applications = [];

  try {
    applications = await getApplications();
  } catch (error) {
    redirect("/auth/signin");
  }

  return <ApplicationsPageClient initialApplications={applications} />;
}
