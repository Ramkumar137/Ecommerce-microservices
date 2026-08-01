import apiClient from "@/api/client";
import { ENV } from "@/config/env";
import type {
  DashboardMetrics,
  OrderMetrics,
  PaymentMetrics,
  RevenueMetrics,
  ProductMetrics,
  SalesMetrics,
  AdminAnalyticsData,
  InventoryMetrics,
  CustomerMetrics,
} from "@/types/analytics";

const BASE = ENV.ANALYTICS_API_URL.replace(/\/$/, "");

const unwrapData = (r: any) => {
  if (r.data && typeof r.data === "object" && "success" in r.data) {
    if (r.data.success) {
      return r.data.data;
    }
    throw new Error(r.data.message || "Analytics API Error");
  }
  return r.data;
};

export const analyticsApi = {
  getAdminAnalytics(): Promise<AdminAnalyticsData> {
    return apiClient
      .get("/api/admin/analytics")
      .catch(() => apiClient.get(`${BASE}/admin/`))
      .then((r) => {
        const payload = unwrapData(r) || {};
        return {
          revenue: payload.revenue ?? payload.totalRevenue ?? payload.total_revenue ?? 0,
          totalOrders: payload.totalOrders ?? payload.total_orders ?? 0,
          totalUsers: payload.totalUsers ?? payload.total_customers ?? 0,
          topProducts: Array.isArray(payload.topProducts)
            ? payload.topProducts
            : Array.isArray(payload.top_selling_products)
            ? payload.top_selling_products
            : [],
          trends: Array.isArray(payload.trends)
            ? payload.trends.map((item: any) => ({
                date: item.date || item.updatedAt || item.updated_at || new Date().toISOString().slice(0, 10),
                orders: Number(item.orders ?? item.totalOrders ?? item.total_orders ?? item.count ?? 0),
              }))
            : [],
        };
      });
  },

  getDashboard(): Promise<DashboardMetrics> {
    return apiClient.get(`${BASE}/dashboard/`).then(unwrapData);
  },

  getOrders(): Promise<OrderMetrics> {
    return apiClient.get(`${BASE}/orders/`).then(unwrapData);
  },

  getPayments(): Promise<PaymentMetrics> {
    return apiClient.get(`${BASE}/payments/`).then(unwrapData);
  },

  getRevenue(): Promise<RevenueMetrics> {
    return apiClient.get(`${BASE}/revenue/`).then(unwrapData);
  },

  getProducts(): Promise<ProductMetrics> {
    return apiClient.get(`${BASE}/products/`).then(unwrapData);
  },

  getSales(): Promise<SalesMetrics> {
    return apiClient.get(`${BASE}/sales/`).then(unwrapData);
  },

  getInventory(): Promise<InventoryMetrics> {
    return apiClient.get(`${BASE}/inventory/`).then(unwrapData);
  },

  getCustomers(): Promise<CustomerMetrics> {
    return apiClient.get(`${BASE}/customers/`).then(unwrapData);
  },
};
