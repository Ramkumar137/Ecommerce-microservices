import apiClient from "./client";
import { ENV } from "@/config/env";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "@/types/order";

const ORDER_URL = ENV.ORDER_API_URL.replace(/\/$/, "");

export const ordersApi = {
  list(): Promise<Order[]> {
    return apiClient.get(`${ORDER_URL}/`).then((response) => response.data);
  },

  get(id: string): Promise<Order> {
    return apiClient.get(`${ORDER_URL}/${id}/`).then((response) => response.data);
  },

  create(payload: CreateOrderRequest): Promise<Order> {
    return apiClient.post(`${ORDER_URL}/`, payload).then((response) => response.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${ORDER_URL}/${id}/`).then((response) => response.data);
  },

  updateStatus(id: string, payload: UpdateOrderStatusRequest): Promise<Order> {
    return apiClient.patch(`${ORDER_URL}/${id}/status/`, payload).then((response) => response.data);
  },
};