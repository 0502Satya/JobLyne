import "server-only";
import { authenticatedFetch } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";
import { CandidateApplication } from "@/types/application";
import { Job } from "@/types/job";

export async function getApplications(): Promise<CandidateApplication[]> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/applications/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch applications");
  }
  
  return await res.json();
}

export async function getSavedJobs(): Promise<Job[]> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-jobs/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch saved jobs");
  }
  
  return await res.json();
}
