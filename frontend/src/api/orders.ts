import apiClient from "./client";
import { ENV } from "@/config/env";
import type {
  Order,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "@/types/order";

const ORDER_URL = ENV.ORDER_API_URL.replace(/\/$/, "");

export const ordersApi = {
  list(): Promise<Order[]> {
    return apiClient.get(`${ORDER_URL}/`).then((response) => response.data);
  },

  listAdmin(): Promise<Order[]> {
    const parentUrl = ORDER_URL.replace(/\/orders\/?$/, "");
    return apiClient
      .get(`${parentUrl}/admin/orders/`)
      .catch(() => apiClient.get(`${ORDER_URL}/admin/`))
      .catch(() => apiClient.get(`${ORDER_URL}/all/`))
      .catch(() => apiClient.get(`${ORDER_URL}/`))
      .then((response) =>
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || response.data?.orders || []
      );
  },

  get(id: string): Promise<Order> {
    return apiClient.get(`${ORDER_URL}/${id}/`).then((response) => response.data);
  },

  create(payload: CreateOrderRequest): Promise<Order> {
    const rawPayload = { ...payload } as any;
    const totalVal = rawPayload.total_amount ?? rawPayload.totalAmount;
    
    // Remove camelCase duplicate totalAmount completely
    delete rawPayload.totalAmount;
    
    const cleanPayload = {
      ...rawPayload,
      total_amount: totalVal,
    };

    console.log("[POST /orders/] Clean Request Payload:", cleanPayload);
    return apiClient.post(`${ORDER_URL}/`, cleanPayload).then((response) => response.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${ORDER_URL}/${id}/`).then((response) => response.data);
  },

  updateStatus(id: string, payload: UpdateOrderStatusRequest): Promise<Order> {
    const rawStatus = String(payload.status || "").toUpperCase().trim();
    const finalStatus = rawStatus === "COMPLETED" ? "SUCCESS" : rawStatus;

    const allowedStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "CANCELLED"];
    const statusToSend = (allowedStatuses.includes(finalStatus) ? finalStatus : finalStatus) as OrderStatus;

    const cleanPayload = {
      status: statusToSend,
    };

    console.log(`[PATCH /orders/${id}/status/] sending body:`, cleanPayload);
    return apiClient.patch(`${ORDER_URL}/${id}/status/`, cleanPayload).then((response) => response.data);
  },
};