import "server-only";
import { authenticatedFetch } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";

export async function getThreads() {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/messages/threads/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch active message threads");
  }
  
  return await res.json();
}
