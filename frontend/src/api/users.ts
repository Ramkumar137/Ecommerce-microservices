import apiClient from "./client";
import { ENV } from "@/config/env";
import type { User } from "@/types/auth";

const AUTH_URL = ENV.AUTH_API_URL.replace(/\/$/, "");

export const usersApi = {
  listAdmin(): Promise<User[]> {
    return apiClient
      .get(`${AUTH_URL}/users/`)
      .catch(() => apiClient.get("http://localhost:8000/api/v1/auth/users/"))
      .catch(() => apiClient.get("http://localhost:8000/users/"))
      .catch(() => apiClient.get(`${AUTH_URL.replace(/\/auth\/?$/, "")}/users/`))
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.results || r.data?.users || []))
      .catch((err) => {
        console.warn("[Users API listAdmin Error]", err?.response?.status, err?.message);
        return [];
      });
  },

  getAdmin(userId: string): Promise<User> {
    return apiClient
      .get(`${AUTH_URL}/users/${userId}/`)
      .catch(() => apiClient.get(`http://localhost:8000/api/v1/auth/users/${userId}/`))
      .catch(() => apiClient.get(`http://localhost:8000/users/${userId}/`))
      .then((r) => r.data)
      .catch((err) => {
        console.warn("[Users API getAdmin Error]", err?.response?.status, err?.message);
        throw err;
      });
  },
};

export default usersApi;
