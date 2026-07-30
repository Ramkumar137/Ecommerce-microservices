import { ordersApi } from "@/api/orders";
import type { Order, CreateOrderRequest, UpdateOrderStatusRequest } from "@/types/order";

export class OrderService {
  async getUserOrders(): Promise<Order[]> {
    try {
      return await ordersApi.list();
    } catch (error) {
      console.error("[orderService.getUserOrders error]", error);
      throw error;
    }
  }

  async getAdminOrders(): Promise<Order[]> {
    try {
      return await ordersApi.listAdmin();
    } catch (error) {
      console.error("[orderService.getAdminOrders error]", error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      return await ordersApi.get(id);
    } catch (error) {
      console.error(`[orderService.getOrderById ${id} error]`, error);
      throw error;
    }
  }

  async createOrder(payload: CreateOrderRequest): Promise<Order> {
    try {
      return await ordersApi.create(payload);
    } catch (error) {
      console.error("[orderService.createOrder error]", error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, payload: UpdateOrderStatusRequest): Promise<Order> {
    try {
      return await ordersApi.updateStatus(id, payload);
    } catch (error) {
      console.error(`[orderService.updateOrderStatus ${id} error]`, error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await ordersApi.delete(id);
    } catch (error) {
      console.error(`[orderService.deleteOrder ${id} error]`, error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
export default orderService;
