export interface GoogleJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Dynamically loads the Google Identity Services SDK script.
 */
export function loadGoogleScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    if (window.google?.accounts?.id) {
      return resolve(true);
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Safely decodes a Google OAuth JWT ID token.
 */
export function decodeGoogleJwt(credential: string): GoogleJwtPayload | null {
  try {
    const base64Url = credential.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode Google JWT:", error);
    return null;
  }
}

/**
 * Returns configured VITE_GOOGLE_CLIENT_ID if present.
 */
export function getGoogleClientId(): string {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envClientId && typeof envClientId === "string" && envClientId.trim() !== "") {
    return envClientId.trim();
  }
  return "";
}

/**
 * Triggers Google Identity Services OAuth login prompt/popup.
 */
export async function triggerGoogleOAuth({
  clientId,
  onSuccess,
  onError,
}: {
  clientId: string;
  onSuccess: (data: { email: string; name: string; picture?: string; token: string }) => void;
  onError: (errorMsg: string) => void;
}): Promise<void> {
  const loaded = await loadGoogleScript();
  if (!loaded || !window.google?.accounts?.id) {
    onError("Google Identity Services script failed to load. Please check your internet connection.");
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string; select_by?: string }) => {
        if (!response.credential) {
          onError("Google authentication failed. No credential received.");
          return;
        }

        const payload = decodeGoogleJwt(response.credential);
        if (!payload || !payload.email) {
          onError("Unable to parse user credentials from Google.");
          return;
        }

        const email = payload.email;
        const name = payload.name || `${payload.given_name || "Google"} ${payload.family_name || "User"}`.trim();
        const picture = payload.picture;

        onSuccess({
          email,
          name,
          picture,
          token: response.credential,
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Trigger GIS Prompt
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        if (reason === "opt_out_or_no_session" || reason === "suppressed_by_user") {
          onError("Google prompt was closed or suppressed by browser settings.");
        } else {
          onError(`Google prompt unavailable: ${reason}`);
        }
      } else if (notification.isSkippedMoment()) {
        onError("Google sign-in prompt skipped.");
      }
    });
  } catch (err: any) {
    onError(err.message || "An unexpected error occurred during Google Sign-In.");
  }
}
