import publicClient from "@/api/publicClient";
import apiClient from "@/api/client";
import { ENV } from "@/config/env";
import type { Product, ProductRequest } from "@/types/product";

const BASE_URL = ENV.PRODUCT_API_URL.replace(/\/$/, "");

export const productsService = {
  /**
   * Fetch all active products from backend
   */
  async getProducts(): Promise<Product[]> {
    const response = await publicClient.get<Product[]>(`${BASE_URL}/`);
    return response.data;
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await publicClient.get<Product>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Create a new product (Requires Auth)
   */
  async createProduct(data: ProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>(`${BASE_URL}/`, data);
    return response.data;
  },

  /**
   * Update product by ID (Requires Auth)
   */
  async updateProduct(id: string, data: ProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  /**
   * Delete product by ID (Requires Auth)
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}/`);
  },
};

// Export alias for backward compatibility with existing imports
export const productsApi = {
  list: productsService.getProducts,
  get: productsService.getProductById,
  create: productsService.createProduct,
  update: productsService.updateProduct,
  remove: productsService.deleteProduct,
};

export default productsService;
