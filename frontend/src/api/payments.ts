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

  listAdmin(): Promise<Payment[]> {
    const parentUrl = PAYMENT_URL.replace(/\/payments\/?$/, "");
    return apiClient
      .get(`${parentUrl}/admin/payments/`)
      .catch(() => apiClient.get(`${PAYMENT_URL}/admin/`))
      .catch(() => apiClient.get(`${PAYMENT_URL}/all/`))
      .catch(() => apiClient.get(`${PAYMENT_URL}/`))
      .then((r) =>
        Array.isArray(r.data)
          ? r.data
          : r.data?.results || r.data?.payments || []
      );
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
    const rawStatus = String(payload.status || "").toUpperCase().trim();
    const finalStatus = rawStatus === "COMPLETED" ? "SUCCESS" : rawStatus;

    const allowedStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "CANCELLED"];
    const statusToSend = (allowedStatuses.includes(finalStatus) ? finalStatus : "SUCCESS") as PaymentStatus;

    const cleanPayload: UpdatePaymentStatusRequest = {
      status: statusToSend,
      transaction_id: payload.transaction_id || `TXN-${Date.now()}`,
    };

    console.log(`[PATCH /payments/${paymentId}/status/] sending clean body:`, cleanPayload);
    return apiClient.patch(`${PAYMENT_URL}/${paymentId}/status/`, cleanPayload).then((r) => r.data);
  },

  delete(paymentId: string): Promise<void> {
    return apiClient.delete(`${PAYMENT_URL}/${paymentId}/`).then((r) => r.data);
  },
};
