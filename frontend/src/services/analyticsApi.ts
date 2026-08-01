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
} from "@/types/analytics";

const BASE = ENV.ANALYTICS_API_URL.replace(/\/$/, "");

export const analyticsApi = {
  getAdminAnalytics(): Promise<AdminAnalyticsData> {
    return apiClient
      .get("/api/admin/analytics")
      .catch(() => apiClient.get(`${BASE}/admin/`))
      .then((r) => {
        console.log("API response from /api/admin/analytics:", r.data);
        const data = r.data || {};
        return {
          revenue: data.revenue ?? data.total_revenue ?? 0,
          totalOrders: data.totalOrders ?? data.total_orders ?? 0,
          totalUsers: data.totalUsers ?? data.total_customers ?? 0,
          topProducts: Array.isArray(data.topProducts)
            ? data.topProducts
            : Array.isArray(data.top_selling_products)
            ? data.top_selling_products
            : [],
          trends: Array.isArray(data.trends)
            ? data.trends.map((item: any) => ({
                date: item.date || item.updated_at || item.created_at || new Date().toISOString().slice(0, 10),
                orders: Number(item.orders ?? item.totalOrders ?? item.total_orders ?? item.count ?? 0),
              }))
            : [],
        };
      });
  },

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
