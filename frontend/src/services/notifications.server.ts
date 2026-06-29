import "server-only";
import { authenticatedFetch } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";

export async function getPreferences() {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/preferences/`);
  if (!res.ok) {
    throw new Error("Failed to fetch notification preferences");
  }
  return await res.json();
}

export async function getSavedSearches() {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-searches/`);
  if (!res.ok) {
    throw new Error("Failed to fetch saved searches");
  }
  return await res.json();
}

export async function getNotifications() {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/`);
  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
}
