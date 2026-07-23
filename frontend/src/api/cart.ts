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
    return apiClient
      .get(`${CART_URL}/`)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response) {
          console.error("[Cart API getCart Error]", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      });
  },

  listAllCarts(): Promise<CartResponse[]> {
    return apiClient.get(`${CART_URL}/all/`).then((r) => r.data);
  },

  addItem(data: AddCartItemRequest): Promise<CartItem> {
    const payload = {
      product_id: String(data.product_id),
      quantity: Number(data.quantity),
    };
    return apiClient
      .post(`${CART_URL}/items/`, payload)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response) {
          console.error("[Cart API addItem Error]", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      });
  },

  updateQuantity(productId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    return apiClient
      .put(`${CART_URL}/items/${productId}/`, data)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response) {
          console.error("[Cart API updateQuantity Error]", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      });
  },

  removeItem(productId: string): Promise<void> {
    return apiClient
      .delete(`${CART_URL}/items/${productId}/`)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response) {
          console.error("[Cart API removeItem Error]", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      });
  },

  clearCart(): Promise<void> {
    return apiClient
      .delete(`${CART_URL}/clear/`)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response) {
          console.error("[Cart API clearCart Error]", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      });
  },
};

export default cartApi;
