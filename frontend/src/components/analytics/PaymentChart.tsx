import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WidgetCard } from "./WidgetCard";
import { usePaymentMetrics } from "@/hooks/useAnalytics";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#94a3b8"];

export function PaymentChart() {
  const { data, isLoading, isError } = usePaymentMetrics();

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Successful", value: data.successfulPayments ?? data.successful_payments ?? 0 },
      { name: "Failed", value: data.failedPayments ?? data.failed_payments ?? 0 },
      { name: "Refunded", value: data.refundedPayments ?? data.refunded_payments ?? 0 },
    ].filter((d) => d.value > 0);
  }, [data]);

  const hasData = Boolean(!isLoading && !isError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Payment Distribution"
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
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, item: any) => [
                value.toLocaleString(),
                item?.payload?.name || name || "Payments",
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
}
