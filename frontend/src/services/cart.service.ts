import { cartApi } from "@/api/cart";
import type { CartResponse, CartItem, AddCartItemRequest, UpdateCartItemRequest } from "@/types/cart";

export class CartService {
  async getCart(): Promise<CartResponse> {
    try {
      return await cartApi.getCart();
    } catch (error) {
      console.error("[cartService.getCart error]", error);
      throw error;
    }
  }

  async addItem(data: AddCartItemRequest): Promise<CartItem> {
    try {
      return await cartApi.addItem(data);
    } catch (error) {
      console.error("[cartService.addItem error]", error);
      throw error;
    }
  }

  async updateQuantity(productId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    try {
      return await cartApi.updateQuantity(productId, data);
    } catch (error) {
      console.error(`[cartService.updateQuantity ${productId} error]`, error);
      throw error;
    }
  }

  async removeItem(productId: string): Promise<void> {
    try {
      await cartApi.removeItem(productId);
    } catch (error) {
      console.error(`[cartService.removeItem ${productId} error]`, error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await cartApi.clearCart();
    } catch (error) {
      console.error("[cartService.clearCart error]", error);
      throw error;
    }
  }
}

export const cartService = new CartService();
export default cartService;
