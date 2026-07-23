import publicClient from "@/api/publicClient";
import apiClient from "@/api/client";
import { ENV } from "@/config/env";
import type {
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  LoginResponse,
  User,
  UpdateProfileRequest,
} from "@/types/auth";

const AUTH_URL = ENV.AUTH_API_URL.replace(/\/$/, "");

export const authService = {
  /**
   * User Registration
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await publicClient.post<User>(`${AUTH_URL}/register/`, data);
    return response.data;
  },

  /**
   * User Login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await publicClient.post<LoginResponse>(`${AUTH_URL}/login/`, data);
    return response.data;
  },

  /**
   * User Logout
   */
  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_URL}/logout/`);
  },

  /**
   * Refresh Token
   */
  async refresh(data: RefreshRequest): Promise<{ access_token: string }> {
    const response = await publicClient.post<{ access_token: string }>(`${AUTH_URL}/refresh/`, data);
    return response.data;
  },

  /**
   * Get Current User Profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(`${AUTH_URL}/profile/`);
    return response.data;
  },

  /**
   * Update Profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(`${AUTH_URL}/profile/`, data);
    return response.data;
  },

  /**
   * Delete Profile
   */
  async deleteProfile(): Promise<void> {
    await apiClient.delete(`${AUTH_URL}/profile/`);
  },
};

export const authApi = authService;
export default authService;
