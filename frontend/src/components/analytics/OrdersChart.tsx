import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WidgetCard } from "./WidgetCard";
import { useDashboardMetrics } from "@/hooks/useAnalytics";

export function OrdersChart() {
  const { data, isLoading, isError } = useDashboardMetrics();

  const chartData = useMemo(() => {
    if (!data?.recent_orders?.length) return [];

    const byDate = new Map<string, number>();
    for (const order of data.recent_orders) {
      if (!order.updated_at) continue;
      const date = order.updated_at.slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, orders]) => ({ date, orders }));
  }, [data]);

  return (
    <WidgetCard
      title="Orders Trend"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && chartData.length === 0}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
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
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            formatter={(value: number) => [value, "Orders"]}
            labelFormatter={(label: string) => new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
