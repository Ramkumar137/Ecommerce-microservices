import apiClient from "./client";
import { ENV } from "@/config/env";

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
}

// const AUTH_URL = ENV.AUTH_API_URL;
const AUTH_URL = ENV.AUTH_API_URL.replace(/\/$/, "");
console.log("AUTH URL:", AUTH_URL);

export const authApi = {
  register(data: RegisterRequest) {
    return apiClient.post(`${AUTH_URL}/register/`, data);
  },

  login(data: LoginRequest) {
    return apiClient.post(`${AUTH_URL}/login/`, data);
  },

  refresh(data: RefreshRequest) {
    return apiClient.post(`${AUTH_URL}/refresh/`, data);
  },

  getProfile() {
    return apiClient.get(`${AUTH_URL}/profile/`);
  },

  updateProfile(data: UpdateProfileRequest) {
    return apiClient.put(`${AUTH_URL}/profile/`, data);
  },
  
};