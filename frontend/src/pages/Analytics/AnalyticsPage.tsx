import { useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { AnalyticsStatsSkeleton } from "@/components/common/SkeletonLoaders";
import { Button } from "@/components/ui/button";
import { OrderStatusChart } from "@/components/analytics/OrderStatusChart";
import { PaymentChart } from "@/components/analytics/PaymentChart";
import { TopProductsChart } from "@/components/analytics/TopProductsChart";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { OrdersChart } from "@/components/analytics/OrdersChart";
import { CustomerGrowthChart } from "@/components/analytics/CustomerGrowthChart";
import { InventoryChart } from "@/components/analytics/InventoryChart";
import { useAdminAnalytics, useDashboardMetrics, useOrderMetrics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";

const parseSafeNumber = (val: any): number => {
  if (val === undefined || val === null) return 0;
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  return isNaN(num) ? 0 : num;
};

export default function AnalyticsPage() {
  const queryClient = useQueryClient();

  const {
    data: adminData,
    isLoading: adminLoading,
    isError: adminError,
    error: adminErrDetail,
  } = useAdminAnalytics();

  const {
    data: dashboard,
    isLoading: dashLoading,
    isError: dashError,
    error: dashErrDetail,
    isRefetching: dashRefetching,
    refetch: refetchDash,
  } = useDashboardMetrics();

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrDetail,
    refetch: refetchOrders,
  } = useOrderMetrics();

  const totalRevenue = parseSafeNumber(adminData?.revenue ?? dashboard?.totalRevenue ?? dashboard?.total_revenue);
  const totalOrdersCount = parseSafeNumber(adminData?.totalOrders ?? dashboard?.totalOrders ?? dashboard?.total_orders);
  const totalUsersCount = parseSafeNumber(adminData?.totalUsers ?? dashboard?.totalCustomers ?? dashboard?.total_customers);
  const totalProductsCount = parseSafeNumber(dashboard?.totalProducts ?? dashboard?.total_products);
  const pendingOrdersCount = parseSafeNumber(orders?.pending);
  const deliveredOrdersCount = parseSafeNumber(orders?.delivered);

  const kpiLoading = adminLoading || dashLoading || ordersLoading;
  const isError = adminError || dashError || ordersError;
  const errorObj = adminErrDetail || dashErrDetail || ordersErrDetail;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    refetchDash();
    refetchOrders();
  }, [queryClient, refetchDash, refetchOrders]);

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        description="Real-time business metrics and performance analytics — auto-refreshes every 30 seconds."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={dashRefetching}
              className="gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${dashRefetching ? "animate-spin" : ""}`} />
              {dashRefetching ? "Refreshing…" : "Refresh"}
            </Button>
            {/* <Button asChild variant="ghost" size="sm">
              <Link to="/admin">
                <ArrowLeft className="mr-1 size-3.5" />
                Back
              </Link>
            </Button> */}
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="mt-6">
        {kpiLoading ? (
          <AnalyticsStatsSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="size-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-foreground">Failed to load analytics data</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(errorObj as any)?.response?.data?.message ||
                    (errorObj as any)?.message ||
                    "Unable to connect to Analytics Service."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 gap-2">
                <RefreshCw className="size-3.5" /> Retry Fetching
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
            />
            <StatCard
              label="Total Orders"
              value={totalOrdersCount.toLocaleString("en-US")}
              icon={ShoppingBag}
            />
            <StatCard
              label="Total Customers"
              value={totalUsersCount.toLocaleString("en-US")}
              icon={Users}
            />
            <StatCard
              label="Total Products"
              value={totalProductsCount.toLocaleString("en-US")}
              icon={Package}
            />
            <StatCard
              label="Pending Orders"
              value={pendingOrdersCount.toLocaleString("en-US")}
              icon={Clock}
            />
            <StatCard
              label="Delivered Orders"
              value={deliveredOrdersCount.toLocaleString("en-US")}
              icon={CheckCircle2}
            />
          </div>
        )}
      </div>

      {/* Row 1: Revenue Trend (Line) + Orders Trend (Bar) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <OrdersChart />
      </div>

      {/* Row 2: Order Status Distribution (Pie) + Payment Distribution (Pie) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OrderStatusChart />
        <PaymentChart />
      </div>

      {/* Row 3: Top Selling Products (Horizontal Bar) */}
      <div className="mt-6">
        <TopProductsChart />
      </div>

      {/* Row 4: Customer Growth (Line) + Inventory Overview (Bar) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CustomerGrowthChart />
        <InventoryChart />
      </div>

      {/* Last Updated Timestamp */}
      {dashboard?.updated_at && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date(dashboard.updated_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </>
  );
}
