"use server";

import { authenticatedFetch } from "../auth/apiClient";
import { API_BASE_URL } from "../auth/config";

export async function getRecruiterDashboardAction(query?: string) {
  try {
    const url = query ? `${API_BASE_URL}/api/recruiter/dashboard/?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/api/recruiter/dashboard/`;
    const res = await authenticatedFetch(url);

    if (!res.ok) {
      if (res.status === 403) return { error: "Access denied. Recruiters only." };
      return { error: "Failed to fetch recruiter dashboard data" };
    }

    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function postRecruiterCandidateAction(
  candidateId: string,
  action: 'invite' | 'advance' | 'toggle_shortlist' | 'schedule_interview' | 'unlock',
  extraData: { interview_schedule?: string } = {}
) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/recruiter/candidate-action/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        action,
        ...extraData,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || `Failed to perform action: ${action}` };
    }

    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}
