"use server";

import { authenticatedFetch, setAuthCookies } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";
import { cookies } from "next/headers";

export async function adminLoginAction(data: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Invalid credentials." };
    }

    const result = await res.json();
    if (result.tokens) {
      await setAuthCookies(result.tokens, "ADMIN");
      
      // Save admin-specific details in cookie for layout rendering
      const cookieStore = await cookies();
      cookieStore.set("admin_name", result.user.name, { path: "/" });
      cookieStore.set("admin_role", result.user.role, { path: "/" });
      cookieStore.set("admin_perms", JSON.stringify(result.user.permissions), { path: "/" });
    }

    return result;
  } catch (err) {
    return { error: "Network connection refused." };
  }
}

export async function getAdminStatsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/stats/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch stats." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminCompaniesAction(params: { status?: string; industry?: string; search?: string } = {}) {
  try {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.industry) query.append("industry", params.industry);
    if (params.search) query.append("search", params.search);

    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/companies/?${query.toString()}`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch companies list." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminCompanyDetailAction(id: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/companies/${id}/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch company details." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function moderateCompanyAction(id: string, action: string, notes: string = "") {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/companies/${id}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Action failed." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminCandidatesAction(search: string = "") {
  try {
    const query = new URLSearchParams();
    if (search) query.append("search", search);

    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/candidates/?${query.toString()}`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch candidates." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminCandidateDetailAction(id: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/candidates/${id}/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch candidate profile." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function moderateCandidateAction(id: string, action: string, notes: string = "") {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/candidates/${id}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Action failed." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminJobsAction(search: string = "", status: string = "") {
  try {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (status) query.append("status", status);

    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/jobs/?${query.toString()}`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch job posts." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function moderateJobAction(id: string, action: string, notes: string = "") {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/jobs/${id}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Action failed." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminListAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/admins/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch admin users." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function createAdminAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/admins/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to invite admin teammate." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminLogsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/logs/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch audit logs." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function getAdminSupportReportsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/reports/`, {
      method: "GET",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch support reports." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function moderateSupportReportAction(reportId: string, action: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, action }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Action failed." };
    }
    return await res.json();
  } catch (err) {
    return { error: "Network error." };
  }
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt_access");
  cookieStore.delete("jwt_refresh");
  cookieStore.delete("joblyne_session");
  cookieStore.delete("joblyne_role");
  cookieStore.delete("admin_name");
  cookieStore.delete("admin_role");
  cookieStore.delete("admin_perms");
  return { success: true };
}
