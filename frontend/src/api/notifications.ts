import apiClient from "./client";
import { ENV } from "@/config/env";

const BASE = ENV.NOTIFICATION_API_URL.replace(/\/$/, "");

export interface Notification {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: "READ" | "UNREAD";
  role: string;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () =>
    apiClient.get<Notification[]>(`${BASE}/`).then((r) => r.data),

  markAsRead: (notificationId: string) =>
    apiClient
      .patch<Notification>(`${BASE}/${notificationId}/read/`)
      .then((r) => r.data),

  markAllAsRead: () =>
    apiClient.patch(`${BASE}/read-all/`).then((r) => r.data),

  delete: (notificationId: string) =>
    apiClient.delete(`${BASE}/${notificationId}/delete/`).then((r) => r.data),
};
