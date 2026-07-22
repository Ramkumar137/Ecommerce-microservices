import apiClient from "./client";
import publicClient from "./client";
import { ENV } from "@/config/env";
import type { Product, ProductRequest } from "@/types/product";

const PRODUCT_URL = ENV.PRODUCT_API_URL;

export const productsApi = {
  list() {
    return publicClient.get(`${PRODUCT_URL}/`).then((r) => r.data);
  },

  get(id: string) {
    return publicClient.get(`${PRODUCT_URL}/${id}/`).then((r) => r.data);
  },

  create(data: ProductRequest){
    return apiClient.post<Product>(`${PRODUCT_URL}/`, data).then((r) => r.data);
  },

  update(
    id: string,
    data: ProductRequest
  ) {
    return apiClient
      .put<Product>(`${PRODUCT_URL}/${id}/`, data)
      .then((r) => r.data);
  },

  remove(id: string) {
    return apiClient.delete(`${PRODUCT_URL}/${id}/`);
  },
};