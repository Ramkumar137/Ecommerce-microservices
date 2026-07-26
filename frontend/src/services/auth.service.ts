import { authService } from "@/api/services/auth";
import { storage } from "@/utils/storage";
import { isJwtExpired, handleSessionExpired } from "@/utils/session";
import type { LoginRequest, RegisterRequest, User, LoginResponse, UpdateProfileRequest } from "@/types/auth";

class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    return await authService.register(data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const loginData = await authService.login(data);

    if (loginData.access_token) {
      storage.setAccessToken(loginData.access_token);
      const role = String(loginData.user?.role || "").toUpperCase();
      if (role === "ADMIN" || role === "ADMINISTRATOR") {
        storage.setAdminToken(loginData.access_token);
      } else if (typeof localStorage !== "undefined") {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("adminToken");
      }
    }
    if (loginData.refresh_token) {
      storage.setRefreshToken(loginData.refresh_token);
    }
    if (loginData.user) {
      storage.setUser(loginData.user);
    }

    return loginData;
  }

  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      storage.clear();
    }
  }

  /**
   * Initializes authentication session on app load:
   * 1. Validates token expiration immediately before firing requests.
   * 2. If access_token valid, attempts profile fetch directly.
   * 3. If access_token returns 401/403, attempts token refresh using refresh_token.
   * 4. Performs auto-logout only on invalid/expired credentials.
   */
  async initializeAuthSession(): Promise<User | null> {
    const refreshToken = storage.getRefreshToken();
    const accessToken = storage.getAccessToken();

    if (!refreshToken && !accessToken) {
      storage.clear();
      return null;
    }

    // Pre-validate token expiration on app load
    if (accessToken && isJwtExpired(accessToken)) {
      if (!refreshToken || isJwtExpired(refreshToken)) {
        handleSessionExpired();
        return null;
      }
    }

    // 1. Try profile fetch directly using existing access_token
    if (accessToken) {
      try {
        const user = await authService.getProfile();
        if (user) {
          storage.setUser(user);
          return user;
        }
      } catch (err: any) {
        const status = err?.response?.status;
        // If error is not 401/403 (e.g. temporary network offline or server error), return cached user
        if (status !== 401 && status !== 403) {
          const cachedUser = storage.getUser();
          if (cachedUser) return cachedUser;
        }
      }
    }

    // 2. If access token missing or expired (401/403), attempt token refresh
    if (refreshToken) {
      try {
        const refreshed = await authService.refresh({ refresh_token: refreshToken });
        if (refreshed?.access_token) {
          storage.setAccessToken(refreshed.access_token);
          const user = await authService.getProfile();
          if (user) {
            storage.setUser(user);
            return user;
          }
        }
      } catch {
        // Refresh token failed or expired -> clean logout
        storage.clear();
        return null;
      }
    }

    // Fallback: if no valid token remains, clear storage
    storage.clear();
    return null;
  }

  async fetchProfile(): Promise<User | null> {
    try {
      const user = await authService.getProfile();
      storage.setUser(user);
      return user;
    } catch {
      return null;
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const updatedUser = await authService.updateProfile(data);
    storage.setUser(updatedUser);
    return updatedUser;
  }

  getCurrentUser(): User | null {
    return storage.getUser();
  }

  isAuthenticated(): boolean {
    return !!storage.getAccessToken();
  }
}

export default new AuthService();