import { authService } from "@/api/services/auth";
import { storage } from "@/utils/storage";
import { toast } from "sonner";

let isLoggingOut = false;

/**
 * Safely parses JWT token payload without external libraries
 */
export function parseJwt(token: string): Record<string, any> | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired (with 5-second buffer)
 */
export function isJwtExpired(token: string): boolean {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") {
    return false; // If not a standard JWT or no exp, defer to API check
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= payload.exp - 5;
}

/**
 * Complete session cleanup & logout helper (Frontend + Backend sync)
 */
export async function performFullLogout(isExpired = false) {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // 1. Call Backend Logout API (POST /logout/) with auth token if available
  try {
    await authService.logout();
  } catch {
    // Suppress network errors during logout to guarantee client cleanup
  }

  // 2. Wipe storage completely
  storage.clear();

  // 3. Dispatch global custom events to clear React state in all providers
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
    window.dispatchEvent(new CustomEvent("cart:clear"));
  }

  // 4. User feedback toast
  if (isExpired) {
    toast.error("Your session has expired. Please sign in again.", {
      id: "session-expired-toast",
    });
  } else {
    toast.success("Signed out successfully", {
      id: "logout-toast",
    });
  }

  // 5. Preserve current route for post-login redirect if session expired
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAuthPage = currentPath.startsWith("/auth");
  const redirectTarget = isExpired && !isAuthPage
    ? `/auth/login?redirect=${encodeURIComponent(currentPath)}`
    : "/auth/login";

  // 6. Smooth redirect replacing history entry to prevent browser back navigation to protected pages
  setTimeout(() => {
    isLoggingOut = false;
    if (typeof window !== "undefined") {
      window.location.replace(redirectTarget);
    }
  }, 350);
}

/**
 * Global session expiration handler
 */
export function handleSessionExpired() {
  performFullLogout(true);
}
