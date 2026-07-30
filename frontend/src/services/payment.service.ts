import { paymentsApi } from "@/api/payments";
import type { Payment, CreatePaymentRequest, UpdatePaymentStatusRequest } from "@/types/payment";

export class PaymentService {
  async getUserPayments(): Promise<Payment[]> {
    try {
      return await paymentsApi.list();
    } catch (error) {
      console.error("[paymentService.getUserPayments error]", error);
      throw error;
    }
  }

  async getAdminPayments(): Promise<Payment[]> {
    try {
      return await paymentsApi.listAdmin();
    } catch (error) {
      console.error("[paymentService.getAdminPayments error]", error);
      throw error;
    }
  }

  async createPayment(payload: CreatePaymentRequest): Promise<Payment> {
    try {
      return await paymentsApi.create(payload);
    } catch (error) {
      console.error("[paymentService.createPayment error]", error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      return await paymentsApi.get(paymentId);
    } catch (error) {
      console.error(`[paymentService.getPaymentById ${paymentId} error]`, error);
      throw error;
    }
  }

  async getPaymentByOrder(orderId: string): Promise<Payment> {
    try {
      return await paymentsApi.getByOrder(orderId);
    } catch (error) {
      console.error(`[paymentService.getPaymentByOrder ${orderId} error]`, error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, payload: UpdatePaymentStatusRequest): Promise<Payment> {
    try {
      return await paymentsApi.updateStatus(paymentId, payload);
    } catch (error) {
      console.error(`[paymentService.updatePaymentStatus ${paymentId} error]`, error);
      throw error;
    }
  }

  async deletePayment(paymentId: string): Promise<void> {
    try {
      await paymentsApi.delete(paymentId);
    } catch (error) {
      console.error(`[paymentService.deletePayment ${paymentId} error]`, error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
