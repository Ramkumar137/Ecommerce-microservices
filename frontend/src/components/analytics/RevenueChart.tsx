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
import { useRevenueMetrics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";

const CHART_HEIGHT = 220;

export const RevenueChart = memo(function RevenueChart() {
  const queryClient = useQueryClient();
  const { data: revenueData, isLoading, isError, isRefetching } = useRevenueMetrics();

  const chartData = useMemo(() => {
    const items = Array.isArray(revenueData) ? revenueData : [];
    if (!items.length) {
      const today = new Date().toISOString().slice(0, 10);
      return [{ date: today, revenue: 0, label: "Revenue", value: 0 }];
    }

    return items.map((item: any) => {
      const rev = typeof item.revenue === "number" ? item.revenue : Number(item.revenue || 0);
      const safeRev = isNaN(rev) ? 0 : rev;
      const dateStr = item.date || new Date().toISOString().slice(0, 10);
      return {
        date: dateStr,
        revenue: safeRev,
        label: "Revenue",
        value: safeRev,
      };
    });
  }, [revenueData]);

  const hasData = Boolean(!isLoading && !isError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Revenue Trend"
      loading={isLoading}
      error={isError}
      empty={!isLoading && !isError && (!chartData || chartData.length === 0)}
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
