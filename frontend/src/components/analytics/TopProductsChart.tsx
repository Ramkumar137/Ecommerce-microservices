import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { WidgetCard } from "./WidgetCard";
import { useDashboardMetrics } from "@/hooks/useAnalytics";

const BAR_COLOR = "#6366f1";

export function TopProductsChart() {
  const { data, isLoading, isError } = useDashboardMetrics();

  const chartData = useMemo(() => {
    if (!data?.top_selling_products) return [];
    return [...data.top_selling_products]
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 8)
      .map((p) => ({
        name: p.product_name?.length > 20 ? `${p.product_name.slice(0, 18)}…` : p.product_name,
        fullName: p.product_name,
        sold: p.total_sold,
      }));
  }, [data]);

  return (
    <WidgetCard
      title="Top Selling Products"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && chartData.length === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(value: number, _: string, props: { payload?: { fullName?: string } }) => [
              value.toLocaleString(),
              props.payload?.fullName ?? "Units Sold",
            ]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="sold" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={BAR_COLOR} fillOpacity={1 - i * 0.07} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
