export interface TopSellingProduct {
  metricType?: string;
  metricId?: string;
  productName?: string;
  totalSold?: number;
  updatedAt?: string;
  // Legacy aliases
  metric_type?: string;
  metric_id?: string;
  product_name?: string;
  total_sold?: number;
  updated_at?: string;
}

export interface RecentOrder {
  metricType?: string;
  metricId?: string;
  userId?: string;
  totalAmount?: number;
  status?: string;
  updatedAt?: string;
  // Legacy aliases
  metric_type?: string;
  metric_id?: string;
  user_id?: string;
  total_amount?: number;
  updated_at?: string;
}

export interface DashboardMetrics {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  totalProducts?: number;
  successfulPayments?: number;
  failedPayments?: number;
  topSellingProducts?: TopSellingProduct[];
  recentOrders?: RecentOrder[];
  updatedAt?: string;
  // Legacy aliases
  total_revenue?: number;
  total_orders?: number;
  total_customers?: number;
  total_products?: number;
  successful_payments?: number;
  failed_payments?: number;
  top_selling_products?: TopSellingProduct[];
  recent_orders?: RecentOrder[];
  updated_at?: string;
}

export interface OrderMetrics {
  totalOrders?: number;
  pending?: number;
  confirmed?: number;
  processing?: number;
  shipped?: number;
  delivered?: number;
  cancelled?: number;
  updatedAt?: string;
  // Legacy aliases
  total_orders?: number;
  updated_at?: string;
}

export interface PaymentMetrics {
  totalPayments?: number;
  successfulPayments?: number;
  failedPayments?: number;
  refundedPayments?: number;
  updatedAt?: string;
  // Legacy aliases
  total_payments?: number;
  successful_payments?: number;
  failed_payments?: number;
  refunded_payments?: number;
  updated_at?: string;
}

export interface RevenueMetricsPoint {
  date: string;
  revenue: number;
}

export type RevenueMetrics = RevenueMetricsPoint[];

export interface ProductMetricsItem {
  metricId?: string;
  productName?: string;
  totalSold?: number;
  updatedAt?: string;
  // Legacy aliases
  metric_id?: string;
  product_name?: string;
  total_sold?: number;
  updated_at?: string;
}

export interface ProductMetrics {
  products: ProductMetricsItem[];
  total: number;
}

export interface SalesMetrics {
  totalRevenue?: number;
  totalPayments?: number;
  successfulPayments?: number;
  failedPayments?: number;
  updatedAt?: string;
  // Legacy aliases
  total_revenue?: number;
  total_payments?: number;
  successful_payments?: number;
  failed_payments?: number;
  updated_at?: string;
}

export interface OrderTrendItem {
  date: string;
  orders: number;
}

export interface AdminAnalyticsData {
  revenue: number;
  totalOrders: number;
  totalUsers: number;
  topProducts: Array<{
    id?: string;
    name?: string;
    totalSold?: number;
    [key: string]: any;
  }>;
  trends: OrderTrendItem[];
}

export interface InventoryMetrics {
  totalStock?: number;
  availableStock?: number;
  reservedStock?: number;
  lowStockProducts?: number;
  outOfStockProducts?: number;
  updatedAt?: string;
  // Legacy aliases
  total_stock?: number;
  available_stock?: number;
  reserved_stock?: number;
  low_stock_products?: number;
  out_of_stock_products?: number;
  updated_at?: string;
}

export interface CustomerMetrics {
  cartAbandonmentRate?: number;
  activeCustomers?: number;
  returningCustomers?: number;
  newCustomers?: number;
  updatedAt?: string;
  // Legacy aliases
  cart_abandonment_rate?: number;
  active_customers?: number;
  returning_customers?: number;
  new_customers?: number;
  updated_at?: string;
}
