"use server";

import { authenticatedFetch } from "./apiClient";
import { API_BASE_URL } from "./config";
import { revalidatePath } from "next/cache";

export async function getThreadsAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/`);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Failed to fetch active message threads" };
    }

    return await res.json();
  } catch (err) {
    return { error: "Network connection error" };
  }
}

export async function getThreadMessagesAction(threadId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/${threadId}/messages/`);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Failed to fetch thread message history" };
    }

    return await res.json();
  } catch (err) {
    return { error: "Network connection error" };
  }
}

export async function sendMessageAction(threadId: string, content: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/${threadId}/messages/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to transmit message" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/messages");
    return data;
  } catch (err) {
    return { error: "Network connection error" };
  }
}

export async function markThreadReadAction(threadId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/${threadId}/read/`, {
      method: "POST",
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to mark thread as read" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/messages");
    return data;
  } catch (err) {
    return { error: "Network connection error" };
  }
}

export async function startThreadAction(recipientId: string) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: recipientId }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to initialize message thread" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/messages");
    return data;
  } catch (err) {
    return { error: "Network connection error" };
  }
}
