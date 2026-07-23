export interface CartItem {
  product_id: string;
  quantity: number;
  price?: number;
  product_name?: string;
  image_url?: string;
  total_price?: number;
}

export interface CartResponse {
  user_id: string;
  items: CartItem[];
  total_amount: number;
  updated_at?: string;
}

export interface AddCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
