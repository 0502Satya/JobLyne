"use server";

import { cookies } from "next/headers";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("jwt_refresh")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.access) {
      cookieStore.set("jwt_access", data.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
      
      if (data.refresh) {
        cookieStore.set("jwt_refresh", data.refresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
      return data.access; // Return the new token directly
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  let token = cookieStore.get("jwt_access")?.value;

  // 1. If no token, attempt immediate refresh
  if (!token) {
    token = await refreshAccessToken();
  }

  // 2. Initial attempt (if token exists or was just refreshed)
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // 3. If 401 Unauthorized, try refresh and retry ONCE
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return res;
}
