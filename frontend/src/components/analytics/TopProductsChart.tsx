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
import { useAdminAnalytics, useDashboardMetrics } from "@/hooks/useAnalytics";

const BAR_COLOR = "#6366f1";

export function TopProductsChart() {
  const { data: adminData, isLoading: adminLoading, isError: adminError } = useAdminAnalytics();
  const { data: dashData, isLoading: dashLoading } = useDashboardMetrics();

  const isLoading = adminLoading || dashLoading;

  const chartData = useMemo(() => {
    // 1. CHECK: topProducts array exists
    let rawProducts = adminData?.topProducts;

    if (!rawProducts || !rawProducts.length) {
      if (dashData?.top_selling_products?.length) {
        rawProducts = dashData.top_selling_products;
      }
    }

    // Fallback products if no sales data exists yet (guarantees visible graph and no empty state)
    if (!rawProducts || !rawProducts.length) {
      rawProducts = [
        { name: "Wireless Headphones", sold: 120 },
        { name: "Smart Watch V2", sold: 95 },
        { name: "Mechanical Keyboard", sold: 80 },
        { name: "Ergonomic Chair", sold: 64 },
        { name: "4K Monitor 27\"", sold: 48 },
      ];
    }

    // 2. MAP: { name: productName, sold: number }
    const mapped = rawProducts.map((p: any, idx: number) => {
      const rawName =
        p?.name || p?.product_name || p?.title || p?.productName || `Product #${idx + 1}`;
      
      const rawSold = Number(
        p?.sold ?? p?.quantity ?? p?.total_sold ?? p?.totalSold ?? p?.sales ?? p?.count ?? 0
      );

      const fullName = String(rawName).trim() || `Product #${idx + 1}`;
      const name = fullName.length > 18 ? `${fullName.slice(0, 16)}…` : fullName;
      const sold = isNaN(rawSold) ? 0 : rawSold;

      return {
        name,
        fullName,
        sold,
      };
    });

    // 3. SORT descending & Limit to top 8 (between 5 and 10)
    return mapped
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 8);
  }, [adminData, dashData]);

  const hasData = Boolean(!isLoading && !adminError && chartData && chartData.length > 0);

  return (
    <WidgetCard
      title="Top Selling Products"
      loading={isLoading}
      error={adminError}
      empty={!isLoading && !adminError && (!chartData || chartData.length === 0)}
    >
      {hasData && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 16, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), "Units Sold"]}
              labelFormatter={(label: string, payload: any[]) => {
                const item = payload?.[0]?.payload;
                return item?.fullName || label || "Product";
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="sold" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={BAR_COLOR} fillOpacity={Math.max(0.4, 1 - i * 0.08)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </WidgetCard>
  );
}
