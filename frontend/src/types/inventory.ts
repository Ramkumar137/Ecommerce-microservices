export interface InventoryItem {
  product_id: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInventoryRequest {
  product_id: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
}

export interface UpdateInventoryRequest {
  total_stock?: number;
  available_stock?: number;
  reserved_stock?: number;
}

export interface ReserveReleaseStockRequest {
  quantity: number;
}
