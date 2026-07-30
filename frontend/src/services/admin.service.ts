import { orderService } from "./order.service";
import { paymentService } from "./payment.service";
import { productService } from "./product.service";
import { usersApi } from "@/api/users";
import { inventoryApi } from "@/api/inventory";
import type { Order } from "@/types/order";
import type { Payment } from "@/types/payment";
import type { Product, ProductRequest } from "@/types/product";
import type { User } from "@/types/auth";
import type { Inventory } from "@/types/inventory";

export class AdminService {
  /**
   * Fetch all system orders for Admin dashboard & orders management
   */
  async getOrders(): Promise<Order[]> {
    return await orderService.getAdminOrders();
  }

  /**
   * Fetch all system payments for Admin dashboard & payments management
   */
  async getPayments(): Promise<Payment[]> {
    return await paymentService.getAdminPayments();
  }

  /**
   * Fetch all products for Admin products inventory management
   */
  async getProducts(): Promise<Product[]> {
    return await productService.getProducts();
  }

  /**
   * Fetch all registered users for Admin user management
   */
  async getUsers(): Promise<User[]> {
    return await usersApi.listAdmin();
  }

  /**
   * Fetch inventory items
   */
  async getInventory(): Promise<Inventory[]> {
    return await inventoryApi.list();
  }

  /**
   * Update order status (ADMIN action)
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return await orderService.updateOrderStatus(orderId, { status: status as any });
  }

  /**
   * Update payment status (ADMIN action)
   */
  async updatePaymentStatus(paymentId: string, status: string, transactionId?: string): Promise<Payment> {
    return await paymentService.updatePaymentStatus(paymentId, { status: status as any, transaction_id: transactionId });
  }

  /**
   * Create product (ADMIN action)
   */
  async createProduct(data: ProductRequest): Promise<Product> {
    return await productService.createProduct(data);
  }

  /**
   * Update product (ADMIN action)
   */
  async updateProduct(id: string, data: ProductRequest): Promise<Product> {
    return await productService.updateProduct(id, data);
  }

  /**
   * Delete product (ADMIN action)
   */
  async deleteProduct(id: string): Promise<void> {
    return await productService.deleteProduct(id);
  }
}

export const adminService = new AdminService();
export default adminService;
