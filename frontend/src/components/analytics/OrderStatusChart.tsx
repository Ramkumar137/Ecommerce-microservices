import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WidgetCard } from "./WidgetCard";
import { useOrderMetrics } from "@/hooks/useAnalytics";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Processing: "#8b5cf6",
  Shipped: "#06b6d4",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

export function OrderStatusChart() {
  const { data, isLoading, isError } = useOrderMetrics();

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Pending", value: data.pending ?? 0 },
      { name: "Confirmed", value: data.confirmed ?? 0 },
      { name: "Processing", value: data.processing ?? 0 },
      { name: "Shipped", value: data.shipped ?? 0 },
      { name: "Delivered", value: data.delivered ?? 0 },
      { name: "Cancelled", value: data.cancelled ?? 0 },
    ].filter((d) => d.value > 0);
  }, [data]);

  const hasData = Boolean(!isLoading && !isError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Order Status Distribution"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && (!chartData || chartData.length === 0)}
    >
      {hasData && (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), "Orders"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
}
