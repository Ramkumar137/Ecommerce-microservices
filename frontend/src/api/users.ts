import apiClient from "./client";
import { ENV } from "@/config/env";
import type { User } from "@/types/auth";

const AUTH_URL = ENV.AUTH_API_URL.replace(/\/$/, "");

export const usersApi = {
  listAdmin(): Promise<User[]> {
    return apiClient
      .get(`${AUTH_URL}/users/`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.results || r.data?.users || []))
      .catch((err) => {
        console.error("[Users API listAdmin Error]", err?.response?.status, err?.response?.data);
        throw err;
      });
  },

  getAdmin(userId: string): Promise<User> {
    return apiClient
      .get(`${AUTH_URL}/users/${userId}/`)
      .then((r) => r.data)
      .catch((err) => {
        console.error("[Users API getAdmin Error]", err?.response?.status, err?.response?.data);
        throw err;
      });
  },
};

export default usersApi;
