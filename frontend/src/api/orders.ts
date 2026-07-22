import apiClient from "./client";

export const ordersApi = {
  list: () =>
    apiClient.get("/orders/").then((response) => response.data),

  get: (id: string) =>
    apiClient.get(`/orders/${id}/`).then((response) => response.data),

  create: (payload: unknown) =>
    apiClient.post("/orders/", payload).then((response) => response.data),
};