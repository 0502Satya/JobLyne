"use server";

import { authenticatedFetch } from "../auth/apiClient";
import { API_BASE_URL } from "../auth/config";

export async function createJobAction(data: {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type?: string;
  experience_required?: number | string;
  salary_min?: number | string;
  salary_max?: number | string;
  skills?: string[];
  currency?: string;
}) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to create job" };
    }

    return { success: true, data: responseData };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function updateJobAction(jobId: string, data: {
  status?: 'OPEN' | 'DRAFT' | 'CLOSED' | string;
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
}) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/jobs/${jobId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to update job" };
    }

    return { success: true, data: responseData };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getApplicantsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/applications/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to fetch applicants" };
    }
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function bulkUpdateApplicantStatusAction(applicationIds: string[], status: string, reason = "") {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/applications/bulk-status-update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        application_ids: applicationIds,
        status: status,
        reason: reason,
      }),
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to update status" };
    }
    return { success: true, data: responseData };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function scheduleInterviewAction(applicationId: string, interviewSchedule: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/applications/${applicationId}/schedule-interview/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interview_schedule: interviewSchedule,
      }),
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to schedule interview" };
    }
    return { success: true, data: responseData };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function compareCandidatesAction(candidateIds: string[]) {
  try {
    const idsQuery = candidateIds.join(",");
    const res = await authenticatedFetch(`${API_BASE_URL}/api/candidate/compare/?candidate_ids=${idsQuery}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await res.json();
    if (!res.ok) {
      return { error: responseData.error || "Failed to fetch comparison details" };
    }
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getTeamMembersAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/team/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to fetch team members" };
    }
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function deleteTeamMemberAction(memberId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/team/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ member_id: memberId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to remove team member" };
    }
    return { success: true, ...data };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getTeamInvitesAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/team/invite/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to fetch invitations" };
    }
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function inviteTeamMemberAction(email: string, role: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/team/invite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to send invitation" };
    }
    return { success: true, ...data };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function acceptTeamInvitationAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/team/accept/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to accept invitation" };
    }
    return { success: true, ...data };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getPublicCompanyProfileAction(companyId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/company/public/${companyId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to fetch public company profile" };
    }
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function uploadCompanyDocAction(formData: FormData) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/upload/`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to upload document" };
    }
    return { success: true, file_url: data.file_url };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function submitCompanyVerificationAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/company/verify/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to submit verification request" };
    }
    return { success: true, ...data };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getPendingVerificationsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/companies/pending/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to fetch pending verification list" };
    }
    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function verifyCompanyAction(companyId: string, action: "approve" | "reject", notes: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/companies/${companyId}/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to process verification action" };
    }
    return { success: true, ...data };
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function deleteJobAction(jobId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/jobs/${jobId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Failed to delete job" };
    }

    return { success: true };
  } catch (err) {
    return { error: "Network error" };
  }
}


