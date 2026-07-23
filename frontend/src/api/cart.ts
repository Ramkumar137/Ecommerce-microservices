import apiClient from "./client";
import { ENV } from "@/config/env";
import type {
  CartResponse,
  CartItem,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from "@/types/cart";

const CART_URL = ENV.CART_API_URL.replace(/\/$/, "");

export const cartApi = {
  getCart(): Promise<CartResponse> {
    return apiClient.get(`${CART_URL}/`).then((r) => r.data);
  },

  listAllCarts(): Promise<CartResponse[]> {
    return apiClient.get(`${CART_URL}/all/`).then((r) => r.data);
  },

  addItem(data: AddCartItemRequest): Promise<CartItem> {
    return apiClient.post(`${CART_URL}/items/`, data).then((r) => r.data);
  },

  updateQuantity(productId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    return apiClient.put(`${CART_URL}/items/${productId}/`, data).then((r) => r.data);
  },

  removeItem(productId: string): Promise<void> {
    return apiClient.delete(`${CART_URL}/items/${productId}/`).then((r) => r.data);
  },

  clearCart(): Promise<void> {
    return apiClient.delete(`${CART_URL}/clear/`).then((r) => r.data);
  },
};
