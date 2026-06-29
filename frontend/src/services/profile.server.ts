import "server-only";
import { authenticatedFetch } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";
import { mapProfile, Profile } from "@/types/profile";
import { UserProfile } from "@/types/user";

export async function getProfile(): Promise<Profile> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/candidate/profile/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }
  
  const data = await res.json();
  return mapProfile(data);
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/profile/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }
  
  return await res.json();
}
