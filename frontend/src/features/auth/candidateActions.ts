"use server";

import { API_BASE_URL, authenticatedFetch } from "./apiClient";

export async function getCandidateProfileAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/candidate/profile/`);

    if (!res.ok) {
      if (res.status === 401) return { error: "Not authenticated" };
      return { error: "Failed to fetch profile" };
    }

    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function updateCandidateProfileAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/candidate/profile/`, {
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

export async function applyToJobAction(jobId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/applications/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job: jobId }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.error || "Failed to apply" };
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getDashboardStatsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/applications/stats/`);

    if (!res.ok) return { error: "Failed to fetch stats" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getActionPlanAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/candidate/action-plan/`);

    if (!res.ok) return { error: "Failed to fetch action plan" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getApplicationsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/applications/`);

    if (!res.ok) return { error: "Failed to fetch applications" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}
