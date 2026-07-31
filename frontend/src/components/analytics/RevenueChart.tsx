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
import { useDashboardMetrics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";

const CHART_HEIGHT = 220;

export const RevenueChart = memo(function RevenueChart() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isRefetching } = useDashboardMetrics();

  const chartData = useMemo(() => {
    if (!data?.recent_orders?.length) return [];
    const byDate = new Map<string, number>();
    for (const order of data.recent_orders) {
      if (!order.updated_at) continue;
      const date = order.updated_at.slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + (order.total_amount ?? 0));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));
  }, [data]);

  return (
    <WidgetCard
      title="Revenue Trend"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && chartData.length === 0}
      refetching={isRefetching}
      chartHeight={CHART_HEIGHT}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            labelFormatter={(label: string) =>
              new Date(label).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1" }}
            activeDot={{ r: 5 }}
            isAnimationActive={!isRefetching}
          />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
});
