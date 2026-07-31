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
import { useDashboardMetrics } from "@/hooks/useAnalytics";

export function CustomerGrowthChart() {
  const { data, isLoading, isError } = useDashboardMetrics();

  // Derive unique active customers per day from recent_orders
  const chartData = useMemo(() => {
    if (!data?.recent_orders?.length) return [];

    const byDate = new Map<string, Set<string>>();
    for (const order of data.recent_orders) {
      if (!order.updated_at || !order.user_id) continue;
      const date = order.updated_at.slice(0, 10);
      if (!byDate.has(date)) byDate.set(date, new Set());
      byDate.get(date)!.add(order.user_id);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date, customers: users.size }));
  }, [data]);

  return (
    <WidgetCard
      title="Active Customers per Day"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && chartData.length === 0}
    >
      <ResponsiveContainer width="100%" height={220}>
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
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            formatter={(value: number) => [value, "Customers"]}
            labelFormatter={(label: string) => new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="customers"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#f59e0b" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
