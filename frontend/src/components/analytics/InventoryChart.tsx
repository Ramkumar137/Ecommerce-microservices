import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WidgetCard } from "./WidgetCard";
import { useInventoryMetrics } from "@/hooks/useAnalytics";

export function InventoryChart() {
  const { data, isLoading, isError } = useInventoryMetrics();

  const chartData = useMemo(() => {
    if (!data) return [];

    return [
      { label: "Available Stock", count: data.availableStock ?? data.available_stock ?? 0 },
      { label: "Reserved Stock", count: data.reservedStock ?? data.reserved_stock ?? 0 },
      { label: "Low Stock Items", count: data.lowStockProducts ?? data.low_stock_products ?? 0 },
      { label: "Out of Stock Items", count: data.outOfStockProducts ?? data.out_of_stock_products ?? 0 },
    ];
  }, [data]);

  const hasData = Boolean(!isLoading && !isError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Inventory Breakdown"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && (!chartData || chartData.length === 0)}
    >
      {hasData && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              formatter={(value: number) => [value, "Units / Items"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="count" name="Inventory Metrics" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
}
