import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WidgetCard } from "./WidgetCard";
import { useAdminAnalytics, useDashboardMetrics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";

const CHART_HEIGHT = 220;

export const RevenueChart = memo(function RevenueChart() {
  const queryClient = useQueryClient();
  const { data: adminData, isLoading: adminLoading, isError: adminError } = useAdminAnalytics();
  const { data: dashData, isLoading: dashLoading, isRefetching } = useDashboardMetrics();

  const isLoading = adminLoading || dashLoading;

  const chartData = useMemo(() => {
    // 1. Check revenue from admin API or dashboard metrics
    const rawRevenue = adminData?.revenue ?? dashData?.total_revenue;
    const revNum = typeof rawRevenue === "string" ? parseFloat(rawRevenue) : Number(rawRevenue);
    const safeRevenue = isNaN(revNum) || revNum === null || revNum === undefined ? 0 : revNum;

    // 2. Build time-series trend data from recent_orders if available
    let points: Array<{ date: string; revenue: number; label: string; value: number }> = [];

    if (dashData?.recent_orders?.length) {
      const byDate = new Map<string, number>();
      for (const order of dashData.recent_orders) {
        if (!order.updated_at) continue;
        const dStr = order.updated_at.slice(0, 10);
        const orderAmt = typeof order.total_amount === "string" ? parseFloat(order.total_amount) : Number(order.total_amount || 0);
        const safeAmt = isNaN(orderAmt) ? 0 : orderAmt;
        byDate.set(dStr, (byDate.get(dStr) ?? 0) + safeAmt);
      }

      points = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rev]) => ({
          date,
          revenue: rev,
          label: "Revenue",
          value: rev,
        }));
    }

    // 3. Ensure fallback format: [{ label: "Revenue", value: safeRevenue }] if no orders exist yet
    if (!points.length) {
      const today = new Date().toISOString().slice(0, 10);
      points = [{ label: "Revenue", value: safeRevenue, revenue: safeRevenue, date: today }];
    }

    return points;
  }, [adminData, dashData]);

  const hasData = Boolean(!isLoading && !adminError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Revenue Trend"
      loading={isLoading}
      error={adminError}
      empty={!isLoading && !adminError && (!chartData || chartData.length === 0)}
      refetching={isRefetching}
      chartHeight={CHART_HEIGHT}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ["analytics"] })}
    >
      {hasData && (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => {
                if (!v) return "";
                const d = new Date(v);
                if (isNaN(d.getTime())) return v;
                return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => {
                const val = isNaN(v) ? 0 : v;
                return `₹${(val / 1000).toFixed(0)}k`;
              }}
              width={48}
            />
            <Tooltip
              formatter={(val: any) => [formatCurrency(val), "Revenue"]}
              labelFormatter={(label: string) => {
                if (!label) return "Revenue";
                const d = new Date(label);
                if (isNaN(d.getTime())) return label;
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#6366f1", strokeWidth: 1, stroke: "#ffffff" }}
              activeDot={{ r: 6 }}
              isAnimationActive={!isRefetching}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
});
