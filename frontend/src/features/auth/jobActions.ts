"use server";

import { authenticatedFetch } from "./apiClient";
import { API_BASE_URL } from "./config";

export async function getJobsAction(params: { 
  query?: string; 
  location?: string; 
  experience?: string; 
  salary_min?: string; 
  salary_max?: string; 
  employment_type?: string; 
  my_jobs?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.append("query", params.query);
  if (params.location) searchParams.append("location", params.location);
  if (params.experience) searchParams.append("experience", params.experience);
  if (params.salary_min) searchParams.append("salary_min", params.salary_min);
  if (params.salary_max) searchParams.append("salary_max", params.salary_max);
  if (params.employment_type) searchParams.append("employment_type", params.employment_type);
  if (params.my_jobs) searchParams.append("my_jobs", params.my_jobs);
  
  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/jobs/${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await authenticatedFetch(url);

    if (!res.ok) return { error: "Failed to fetch jobs" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getJobDetailAction(jobId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/jobs/${jobId}/`);

    if (!res.ok) return { error: "Failed to fetch job details" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getSavedJobsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-jobs/`);

    if (!res.ok) return { error: "Failed to fetch saved jobs" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function saveJobAction(jobId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job: jobId }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.error || "Failed to save job" };
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function unsaveJobAction(jobId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-jobs/${jobId}/`, {
      method: "DELETE",
    });

    if (!res.ok) return { error: "Failed to unsave job" };
    return { success: true };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getCompanyProfileAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/profile/`);

    if (!res.ok) {
      if (res.status === 401) return { error: "Not authenticated" };
      return { error: "Failed to fetch profile" };
    }

    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function updateCompanyProfileAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/profile/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || "Update failed" };
    }

    return { success: true, data: await res.json() };
  } catch (err) {
    return { error: "Network error" };
  }
}
