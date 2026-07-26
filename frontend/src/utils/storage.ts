const ACCESS_TOKEN = "access_token";
const ADMIN_ACCESS_TOKEN = "admin_access_token";
const REFRESH_TOKEN = "refresh_token";
const USER = "user";

export const storage = {
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN, token);
    const userStr = localStorage.getItem(USER);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = String(user?.role || "").toUpperCase();
        if (role === "ADMIN" || role === "ADMINISTRATOR") {
          localStorage.setItem(ADMIN_ACCESS_TOKEN, token);
        }
      } catch {}
    }
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_ACCESS_TOKEN, token);
    localStorage.setItem(ACCESS_TOKEN, token);
  },

  getAdminToken(): string | null {
    if (typeof localStorage === "undefined") return null;
    return (
      localStorage.getItem(ADMIN_ACCESS_TOKEN) ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem(ACCESS_TOKEN) ||
      localStorage.getItem("token")
    );
  },

  getAccessToken(): string | null {
    if (typeof localStorage === "undefined") return null;

    // If request originates from an admin route, prioritize admin_access_token
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      const adminToken =
        localStorage.getItem(ADMIN_ACCESS_TOKEN) ||
        localStorage.getItem("admin_token") ||
        localStorage.getItem("adminToken");
      if (adminToken) return adminToken;
    }

    return (
      localStorage.getItem(ACCESS_TOKEN) ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem(ADMIN_ACCESS_TOKEN) ||
      sessionStorage.getItem(ACCESS_TOKEN) ||
      sessionStorage.getItem("token")
    );
  },

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN, token);
  },

  getRefreshToken() {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN);
  },

  setUser(user: any) {
    localStorage.setItem(USER, JSON.stringify(user));
  },

  getUser() {
    if (typeof localStorage === "undefined") return null;
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  },

  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(ADMIN_ACCESS_TOKEN);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem(USER);
      localStorage.clear();
      sessionStorage.clear();

      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        });
      }
    } catch {}
  },
};