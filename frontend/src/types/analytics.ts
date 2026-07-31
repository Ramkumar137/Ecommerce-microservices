// Matches AnalyticsService.get_dashboard_metrics() response
export interface TopSellingProduct {
  metric_type: string;
  metric_id: string;
  product_name: string;
  total_sold: number;
  updated_at: string;
  created_at?: string;
}

export interface RecentOrder {
  metric_type: string;
  metric_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  updated_at: string;
}

export interface DashboardMetrics {
  metric_type: string;
  metric_id: string;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  successful_payments: number;
  failed_payments: number;
  created_at: string;
  updated_at: string;
  top_selling_products: TopSellingProduct[];
  recent_orders: RecentOrder[];
}

// Matches AnalyticsService.get_order_metrics() response
export interface OrderMetrics {
  metric_type: string;
  metric_id: string;
  total_orders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  created_at: string;
  updated_at: string;
}

// Matches AnalyticsService.get_payment_metrics() response
export interface PaymentMetrics {
  metric_type: string;
  metric_id: string;
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  created_at: string;
  updated_at: string;
}

// Matches AnalyticsService.get_revenue_metrics() response
export interface RevenueMetrics {
  metric_type: string;
  metric_id: string;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

// Matches AnalyticsService.get_product_metrics() response
export interface ProductMetricsItem {
  metric_type: string;
  metric_id: string;
  product_name: string;
  total_sold: number;
  created_at: string;
  updated_at: string;
}

export interface ProductMetrics {
  products: ProductMetricsItem[];
  total: number;
}

// Matches AnalyticsService.get_sales_metrics() response
export interface SalesMetrics {
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
  total_payments: number;
  updated_at: string | null;
}
