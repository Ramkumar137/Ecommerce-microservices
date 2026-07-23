import { authService } from "@/api/services/auth";
import { storage } from "@/utils/storage";
import type { LoginRequest, RegisterRequest, User, LoginResponse, UpdateProfileRequest } from "@/types/auth";

class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    return await authService.register(data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const loginData = await authService.login(data);

    if (loginData.access_token) {
      storage.setAccessToken(loginData.access_token);
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
   * 1. Proactively attempts token refresh if refresh_token is stored.
   * 2. Fetches fresh profile data.
   * 3. Performs auto-logout on failure.
   */
  async initializeAuthSession(): Promise<User | null> {
    const refreshToken = storage.getRefreshToken();
    const accessToken = storage.getAccessToken();

    if (!refreshToken && !accessToken) {
      storage.clear();
      return null;
    }

    // 1. Refresh access token on app load if refresh token exists
    if (refreshToken) {
      try {
        const refreshed = await authService.refresh({ refresh_token: refreshToken });
        if (refreshed?.access_token) {
          storage.setAccessToken(refreshed.access_token);
        }
      } catch {
        // Auto-logout on refresh failure
        storage.clear();
        return null;
      }
    }

    // 2. Fetch fresh user profile
    try {
      const user = await authService.getProfile();
      storage.setUser(user);
      return user;
    } catch {
      // Auto-logout on profile fetch failure
      storage.clear();
      return null;
    }
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