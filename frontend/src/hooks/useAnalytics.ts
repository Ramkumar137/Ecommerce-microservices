import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { analyticsApi } from "@/services/analyticsApi";

const POLL_INTERVAL = 30_000;

// keepPreviousData ensures charts never blank out during background refetches —
// the stale data stays visible and updates smoothly when fresh data arrives.
const baseOptions = {
  refetchInterval: POLL_INTERVAL,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  retry: 1,
  staleTime: 0,
  placeholderData: keepPreviousData,
};

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: analyticsApi.getAdminAnalytics,
    ...baseOptions,
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: analyticsApi.getDashboard,
    ...baseOptions,
  });
}

export function useOrderMetrics() {
  return useQuery({
    queryKey: ["analytics", "orders"],
    queryFn: analyticsApi.getOrders,
    ...baseOptions,
  });
}

export function usePaymentMetrics() {
  return useQuery({
    queryKey: ["analytics", "payments"],
    queryFn: analyticsApi.getPayments,
    ...baseOptions,
  });
}

export function useRevenueMetrics() {
  return useQuery({
    queryKey: ["analytics", "revenue"],
    queryFn: analyticsApi.getRevenue,
    ...baseOptions,
  });
}

export function useProductMetrics() {
  return useQuery({
    queryKey: ["analytics", "products"],
    queryFn: analyticsApi.getProducts,
    ...baseOptions,
  });
}

export function useSalesMetrics() {
  return useQuery({
    queryKey: ["analytics", "sales"],
    queryFn: analyticsApi.getSales,
    ...baseOptions,
  });
}

export function useInventoryMetrics() {
  return useQuery({
    queryKey: ["analytics", "inventory"],
    queryFn: analyticsApi.getInventory,
    ...baseOptions,
  });
}

export function useCustomerMetrics() {
  return useQuery({
    queryKey: ["analytics", "customers"],
    queryFn: analyticsApi.getCustomers,
    ...baseOptions,
  });
}
