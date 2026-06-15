"use server";

import { authenticatedFetch } from "./apiClient";
import { API_BASE_URL } from "./config";

/**
 * Fetch all notifications for the active authenticated user
 */
export async function getNotificationsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/`);
    if (!res.ok) return { error: "Failed to fetch notifications" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Bulk mark all notifications as read
 */
export async function markAllNotificationsReadAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/`, {
      method: "POST",
    });
    if (!res.ok) return { error: "Failed to mark all as read" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/${notificationId}/read/`, {
      method: "POST",
    });
    if (!res.ok) return { error: "Failed to mark notification as read" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Retrieve user notification preferences
 */
export async function getPreferencesAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/preferences/`);
    if (!res.ok) return { error: "Failed to fetch notification preferences" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Update user notification preferences
 */
export async function updatePreferencesAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/notifications/preferences/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { error: "Failed to update notification preferences" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Fetch all saved search job alerts
 */
export async function getSavedSearchesAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-searches/`);
    if (!res.ok) return { error: "Failed to fetch saved searches" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Create a new saved search job alert
 */
export async function createSavedSearchAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-searches/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) return { error: responseData.error || "Failed to create saved search" };
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

/**
 * Delete a saved search job alert
 */
export async function deleteSavedSearchAction(alertId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/saved-searches/${alertId}/`, {
      method: "DELETE",
    });
    if (!res.ok) return { error: "Failed to delete saved search" };
    return { success: true };
  } catch (err) {
    return { error: "Network error" };
  }
}
