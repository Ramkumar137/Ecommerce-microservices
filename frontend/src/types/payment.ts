export type PaymentStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "SUCCESS" | "COMPLETED";

export interface Payment {
  payment_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  order_id: string;
  payment_method: string;
  amount?: number;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  transaction_id?: string;
}