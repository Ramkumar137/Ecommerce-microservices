import apiClient from "./client";
import { ENV } from "@/config/env";
import type { User } from "@/types/auth";
import { storage } from "@/utils/storage";

const AUTH_URL = ENV.AUTH_API_URL.replace(/\/$/, "");
const ANALYTICS_URL = ENV.ANALYTICS_API_URL.replace(/\/$/, "");
const ORDER_URL = ENV.ORDER_API_URL.replace(/\/$/, "");

export const usersApi = {
  async listAdmin(): Promise<User[]> {
    try {
      // 1. Primary: Direct Users via Auth Service or Analytics Service
      const res = await apiClient
        .get(`${AUTH_URL}/users/`)
        .catch(() => apiClient.get(`${ANALYTICS_URL}/users/`));

      const raw = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data && Array.isArray(res.data.data)
        ? res.data.data
        : res?.data?.results || res?.data?.users || [];

      if (raw.length > 0) {
        return raw.map((u: any) => ({
          user_id: u.user_id || u.userId || u.id,
          first_name: u.first_name || u.firstName || "User",
          last_name: u.last_name || u.lastName || "",
          email: u.email || "",
          username: u.username || u.user_id || "",
          phone: u.phone || "",
          role: String(u.role || "CUSTOMER").toUpperCase(),
          is_active: u.is_active ?? true,
          created_at: u.created_at || u.createdAt,
        }));
      }
    } catch (e) {
      console.warn("[usersApi listAdmin primary failed, trying order/session fallback]", e);
    }

    // 2. Fallback: Extract users from Orders API & local session
    const userMap = new Map<string, User>();

    // Current logged-in user
    const sessionUser = storage.getUser();
    if (sessionUser && sessionUser.user_id) {
      userMap.set(String(sessionUser.user_id), sessionUser);
    }

    try {
      const ordRes = await apiClient.get(`${ORDER_URL}/`);
      const orders = Array.isArray(ordRes.data)
        ? ordRes.data
        : ordRes.data?.results || ordRes.data?.orders || [];

      for (const o of orders) {
        const uid = String(o.user_id || o.userId || "");
        if (!uid || userMap.has(uid)) continue;

        const contact = o.contact || {};
        userMap.set(uid, {
          user_id: uid,
          first_name: contact.first_name || contact.firstName || "Customer",
          last_name: contact.last_name || contact.lastName || "",
          email: contact.email || `${uid.toLowerCase()}@example.com`,
          username: uid,
          role: "CUSTOMER",
          is_active: true,
          created_at: o.created_at || o.createdAt,
        } as User);
      }
    } catch (e) {
      console.warn("[usersApi listAdmin order fallback failed]", e);
    }

    return Array.from(userMap.values());
  },

  getAdmin(userId: string): Promise<User> {
    return apiClient
      .get(`${AUTH_URL}/users/${userId}/`)
      .then((r) => r.data)
      .catch((err) => {
        console.warn("[Users API getAdmin Error]", err?.response?.status, err?.message);
        throw err;
      });
  },
};

export default usersApi;
