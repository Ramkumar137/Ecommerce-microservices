import { useMemo } from "react";
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

export function OrdersChart() {
  const { data: adminData, isLoading: adminLoading, isError: adminError } = useAdminAnalytics();
  const { data: dashData, isLoading: dashLoading } = useDashboardMetrics();

  const isLoading = adminLoading || dashLoading;

  const chartData = useMemo(() => {
    let rawTrends = adminData?.trends;

    // Fallback 1: Extract trends from recent_orders if trends array is empty/missing
    if (!rawTrends || !rawTrends.length) {
      const recentList = dashData?.recentOrders ?? dashData?.recent_orders;
      if (recentList && recentList.length) {
        const byDate = new Map<string, number>();
        for (const order of recentList) {
          const dtStr = order.updatedAt || order.updated_at || order.createdAt || order.created_at;
          if (!dtStr) continue;
          const dStr = String(dtStr).slice(0, 10);
          byDate.set(dStr, (byDate.get(dStr) ?? 0) + 1);
        }
        rawTrends = Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, orders]) => ({ date, orders }));
      }
    }

    // Fallback 2: Generate 7-day initial frame if no order data exists yet (ensures no empty graph)
    if (!rawTrends || !rawTrends.length) {
      const now = new Date();
      rawTrends = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().slice(0, 10), orders: 0 };
      });
    }

    // Clean & map structure: { date: "...", orders: number }
    return rawTrends.map((item: any) => {
      const rawDate = item?.date || item?.updated_at || item?.created_at || new Date().toISOString();
      const rawOrders = Number(
        item?.orders ?? item?.totalOrders ?? item?.total_orders ?? item?.count ?? 0
      );
      return {
        date: String(rawDate),
        orders: isNaN(rawOrders) ? 0 : rawOrders,
      };
    });
  }, [adminData, dashData]);

  const formatDateTick = (val: string) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTooltipDate = (val: string) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const hasData = Boolean(!isLoading && !adminError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Orders Trend"
      loading={isLoading}
      error={adminError}
      empty={!isLoading && !adminError && (!chartData || chartData.length === 0)}
    >
      {hasData && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatDateTick}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              formatter={(value: number) => [value, "Orders"]}
              labelFormatter={formatTooltipDate}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#22c55e", strokeWidth: 1, stroke: "#ffffff" }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
}
