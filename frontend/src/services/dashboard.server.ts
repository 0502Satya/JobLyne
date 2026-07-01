import "server-only";
import { getProfile } from "./profile.server";
import { authenticatedFetch } from "@/features/auth/apiClient";
import { API_BASE_URL } from "@/features/auth/config";
import { DashboardStats, Profile } from "@/types/profile";

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/applications/stats/`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  
  return res.json();
}

export interface DashboardData {
  profile: Profile;
  stats: DashboardStats;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [profile, stats] = await Promise.all([
    getProfile(),
    getDashboardStats()
  ]);
  
  return { profile, stats };
}
