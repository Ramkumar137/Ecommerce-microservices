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
import { useProductMetrics } from "@/hooks/useAnalytics";

export function InventoryChart() {
  const { data, isLoading, isError } = useProductMetrics();

  // Categorise products by sales activity as a proxy for inventory health
  const chartData = useMemo(() => {
    if (!data?.products?.length) return [];

    const inStock = data.products.filter((p) => p.total_sold > 10).length;
    const lowStock = data.products.filter((p) => p.total_sold > 0 && p.total_sold <= 10).length;
    const noSales = data.products.filter((p) => p.total_sold === 0).length;

    return [
      { label: "High Sales", count: inStock },
      { label: "Low Sales", count: lowStock },
      { label: "No Sales", count: noSales },
    ];
  }, [data]);

  return (
    <WidgetCard
      title="Product Sales Activity"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && chartData.length === 0}
    >
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
            formatter={(value: number) => [value, "Products"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="count" name="Products" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
