"use server";

import { cookies } from "next/headers";
import { API_BASE_URL } from "./config";

export async function setAuthCookies(
  tokens: { access: string; refresh: string },
  accountType?: string
) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const base = { httpOnly: true, secure: isProduction, sameSite: 'lax' as const, path: '/' };

  cookieStore.set('jwt_access',       tokens.access,  { ...base, maxAge: 3600 });
  cookieStore.set('jwt_refresh',      tokens.refresh, { ...base, maxAge: 604800 });
  cookieStore.set('joblyne_session',  'true',         { ...base, maxAge: 604800 });
  if (accountType) {
    cookieStore.set('joblyne_role', accountType,      { ...base, maxAge: 604800 });
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("jwt_refresh")?.value;
      if (!refreshToken) return null;

      const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) {
        cookieStore.delete("jwt_access");
        cookieStore.delete("jwt_refresh");
        cookieStore.delete("joblyne_session");
        cookieStore.delete("joblyne_role");
        return null;
      }
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
        return data.access;
      }
      cookieStore.delete("jwt_access");
      cookieStore.delete("jwt_refresh");
      cookieStore.delete("joblyne_session");
      cookieStore.delete("joblyne_role");
      return null;
    } catch (err) {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  let token: string | null | undefined = cookieStore.get("jwt_access")?.value;

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
