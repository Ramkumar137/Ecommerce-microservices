export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

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
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  transaction_id?: string;
}
