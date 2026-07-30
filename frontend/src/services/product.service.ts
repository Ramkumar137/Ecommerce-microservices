import { productsService } from "@/api/services/products";
import type { Product, ProductRequest } from "@/types/product";

export class ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      return await productsService.getProducts();
    } catch (error: any) {
      console.error("[productService.getProducts error]", error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      return await productsService.getProductById(id);
    } catch (error: any) {
      console.error(`[productService.getProductById ${id} error]`, error);
      throw error;
    }
  }

  async createProduct(data: ProductRequest): Promise<Product> {
    try {
      return await productsService.createProduct(data);
    } catch (error: any) {
      console.error("[productService.createProduct error]", error);
      throw error;
    }
  }

  async updateProduct(id: string, data: ProductRequest): Promise<Product> {
    try {
      return await productsService.updateProduct(id, data);
    } catch (error: any) {
      console.error(`[productService.updateProduct ${id} error]`, error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await productsService.deleteProduct(id);
    } catch (error: any) {
      console.error(`[productService.deleteProduct ${id} error]`, error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;
