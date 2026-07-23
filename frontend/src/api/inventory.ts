import apiClient from "./client";
import { ENV } from "@/config/env";
import type {
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  ReserveReleaseStockRequest,
} from "@/types/inventory";

const INVENTORY_URL = ENV.INVENTORY_API_URL.replace(/\/$/, "");

export const inventoryApi = {
  list(): Promise<InventoryItem[]> {
    return apiClient.get(`${INVENTORY_URL}/`).then((r) => r.data);
  },

  get(productId: string): Promise<InventoryItem> {
    return apiClient.get(`${INVENTORY_URL}/${productId}/`).then((r) => r.data);
  },

  create(data: CreateInventoryRequest): Promise<InventoryItem> {
    return apiClient.post(`${INVENTORY_URL}/`, data).then((r) => r.data);
  },

  update(productId: string, data: UpdateInventoryRequest): Promise<InventoryItem> {
    return apiClient.put(`${INVENTORY_URL}/${productId}/`, data).then((r) => r.data);
  },

  delete(productId: string): Promise<void> {
    return apiClient.delete(`${INVENTORY_URL}/${productId}/`).then((r) => r.data);
  },

  reserve(productId: string, data: ReserveReleaseStockRequest): Promise<InventoryItem> {
    return apiClient.patch(`${INVENTORY_URL}/${productId}/reserve/`, data).then((r) => r.data);
  },

  release(productId: string, data: ReserveReleaseStockRequest): Promise<InventoryItem> {
    return apiClient.patch(`${INVENTORY_URL}/${productId}/release/`, data).then((r) => r.data);
  },
};
