"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "./config";
import { setAuthCookies, authenticatedFetch } from "./apiClient";

export async function signupAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirm = formData.get("password_confirm") as string;
  const role = formData.get("role") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  
  // Transform role to match backend ENUM (e.g. "Candidate" -> "CANDIDATE")
  const account_type = role.toUpperCase();

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        password_confirm,
        account_type,
        first_name,
        last_name,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Return the first string error message from the object dictionary if it exists
      const errorMessage = typeof data === 'object' ? Object.values(data).flat()[0] as string : "Signup failed. Please try again.";
      return {
        error: errorMessage,
      };
    }

    if (data.requires_verification) {
      return {
        success: true,
        requiresVerification: true,
        email: email
      };
    }

    // On successful signup (if verification was skipped or disabled), tokens are returned. Store them.
    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
      // Redirect after successfully setting cookies
      redirect("/dashboard");
    }

    return { success: true };

  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return {
      error: "Unable to connect to the server. Please try again later.",
    };
  }
}

export async function companySignupAction(prevState: any, formData: FormData) {
  const company_name = formData.get("companyName") as string;
  const tax_id = (formData.get("taxId") as string) || "";
  const industry = (formData.get("industry") as string) || "";
  const size = (formData.get("companySize") as string) || "";
  const website = (formData.get("website") as string) || "";
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirm = formData.get("password_confirm") as string;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/company/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_name,
        tax_id,
        industry,
        size,
        website,
        email,
        password,
        password_confirm,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Return the first string error message from the object dictionary if it exists
      const errorMessage = typeof data === 'object' ? Object.values(data).flat()[0] as string : "Company Registration failed. Please try again.";
      return {
        error: errorMessage,
      };
    }

    if (data.requires_verification) {
      return {
        success: true,
        requiresVerification: true,
        email: email
      };
    }

    // On successful signup, tokens are returned. Store them.
    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
      redirect("/company");
    }

    return { success: true };

  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return {
      error: "Unable to connect to the server. Please try again later.",
    };
  }
}

export async function recruiterSignupAction(prevState: any, formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirm = formData.get("password_confirm") as string;
  const company_name = formData.get("companyName") as string;
  const designation = formData.get("designation") as string;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/recruiter/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name,
        email,
        password,
        password_confirm,
        company_name,
        designation,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = typeof data === 'object' ? Object.values(data).flat()[0] as string : "Recruiter registration failed.";
      return { error: errorMessage };
    }

    if (data.requires_verification) {
      return {
        success: true,
        requiresVerification: true,
        email: email
      };
    }

    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
      redirect("/recruiter/dashboard");
    }

    return { success: true };

  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: "Unable to connect to the server." };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const targetUrl = `${API_BASE_URL}/api/auth/login/`;
    console.log("[DIAGNOSTIC] loginAction attempting fetch to:", targetUrl);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      const text = await res.text();
      console.error("[DIAGNOSTIC] loginAction failed to parse JSON. Status:", res.status, "Body preview:", text.substring(0, 1000));
      return { error: `Server returned invalid response structure (Status ${res.status}).` };
    }

    if (!res.ok) {
        return {
          error: data.error || "Invalid email or password.",
        };
    }

    // Success, store tokens in HttpOnly cookies
    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
      return { success: true, role: data.user?.account_type };
    }

  } catch (err: any) {
    console.error("[DIAGNOSTIC] loginAction threw exception:", err);
    return {
      error: "Unable to connect to the server. Please try again later.",
    };
  }

  return { success: true };
}

export async function socialLoginAction(provider: "google" | "linkedin", token: string) {
  try {
    const targetUrl = `${API_BASE_URL}/api/auth/social/login/`;
    console.log("[DIAGNOSTIC] socialLoginAction attempting fetch to:", targetUrl);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ provider, token }),
    });

    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      const text = await res.text();
      console.error("[DIAGNOSTIC] socialLoginAction failed to parse JSON. Status:", res.status, "Body preview:", text.substring(0, 1000));
      return { error: `Server returned invalid response structure (Status ${res.status}).` };
    }

    if (!res.ok) {
      return { error: data.error || "Social authentication failed." };
    }

    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[DIAGNOSTIC] socialLoginAction threw exception:", err);
    return { error: "Unable to connect to the server." };
  }
}

export async function verifyOtpAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const otp_code = formData.get("otp_code") as string;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp_code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Verification failed." };
    }

    if (data.tokens) {
      await setAuthCookies(data.tokens, data.user?.account_type);
    }

  } catch (err) {
    return { error: "Unable to connect to the server." };
  }

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("jwt_access");
  cookieStore.delete("jwt_refresh");
  cookieStore.delete("joblyne_session");
  cookieStore.delete("joblyne_role");
  redirect("/auth/signin");
}

export async function getUserProfileAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/profile/`);
    if (!res.ok) return { error: "Failed to fetch user profile" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function updateUserProfileAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/auth/profile/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) return { error: responseData.error || "Failed to update profile details" };
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function getRecruiterProfileAction() {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/recruiter/profile/`);
    if (!res.ok) return { error: "Failed to fetch recruiter profile" };
    return await res.json();
  } catch (err) {
    return { error: "Network error" };
  }
}

export async function updateRecruiterProfileAction(data: any) {
  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/recruiter/profile/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) return { error: responseData.error || "Failed to update recruiter details" };
    return responseData;
  } catch (err) {
    return { error: "Network error" };
  }
}

