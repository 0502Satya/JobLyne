/**
 * Dynamic API Base URL resolver.
 * Handles server-side container network routing and client-side subdomain routing.
 */
export const getApiBaseUrl = (): string => {
    // 1. Client-side browser resolution
    if (typeof window !== "undefined") {
        const host = window.location.host;
        const protocol = window.location.protocol;

        // For local development
        if (host.includes("localhost") || host.includes("127.0.0.1")) {
            return "http://127.0.0.1:8000";
        }

        // For production, resolve api subdomain dynamically
        const cleanHost = host.replace(/^(recruiter\.|company\.|api\.)/, "");
        return `${protocol}//api.${cleanHost}`;
    }

    // 2. Server-side fallback (e.g. Next.js server container contacting backend container)
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();
