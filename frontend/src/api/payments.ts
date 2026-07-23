import apiClient from "./client";
import { ENV } from "@/config/env";
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentStatusRequest,
} from "@/types/payment";

const PAYMENT_URL = ENV.PAYMENT_API_URL.replace(/\/$/, "");

export const paymentsApi = {
  list(): Promise<Payment[]> {
    return apiClient.get(`${PAYMENT_URL}/`).then((r) => r.data);
  },

  create(payload: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post(`${PAYMENT_URL}/`, payload).then((r) => r.data);
  },

  get(paymentId: string): Promise<Payment> {
    return apiClient.get(`${PAYMENT_URL}/${paymentId}/`).then((r) => r.data);
  },

  getByOrder(orderId: string): Promise<Payment> {
    return apiClient.get(`${PAYMENT_URL}/order/${orderId}/`).then((r) => r.data);
  },

  updateStatus(paymentId: string, payload: UpdatePaymentStatusRequest): Promise<Payment> {
    return apiClient.patch(`${PAYMENT_URL}/${paymentId}/status/`, payload).then((r) => r.data);
  },

  delete(paymentId: string): Promise<void> {
    return apiClient.delete(`${PAYMENT_URL}/${paymentId}/`).then((r) => r.data);
  },
};
