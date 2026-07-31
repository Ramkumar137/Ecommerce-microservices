import apiClient from "@/api/client";
import { ENV } from "@/config/env";
import type {
  DashboardMetrics,
  OrderMetrics,
  PaymentMetrics,
  RevenueMetrics,
  ProductMetrics,
  SalesMetrics,
} from "@/types/analytics";

const BASE = ENV.ANALYTICS_API_URL.replace(/\/$/, "");

export const analyticsApi = {
  getDashboard(): Promise<DashboardMetrics> {
    return apiClient.get(`${BASE}/dashboard/`).then((r) => r.data);
  },

  getOrders(): Promise<OrderMetrics> {
    return apiClient.get(`${BASE}/orders/`).then((r) => r.data);
  },

  getPayments(): Promise<PaymentMetrics> {
    return apiClient.get(`${BASE}/payments/`).then((r) => r.data);
  },

  getRevenue(): Promise<RevenueMetrics> {
    return apiClient.get(`${BASE}/revenue/`).then((r) => r.data);
  },

  getProducts(): Promise<ProductMetrics> {
    return apiClient.get(`${BASE}/products/`).then((r) => r.data);
  },

  getSales(): Promise<SalesMetrics> {
    return apiClient.get(`${BASE}/sales/`).then((r) => r.data);
  },
};
