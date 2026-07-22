export interface Product {
  product_id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
}