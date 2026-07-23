export interface OrderItem {
  product_id: string;
  quantity: number;
  price?: number;
  product_name?: string;
  image_url?: string;
  total_price?: number;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  order_id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
