import apiClient from "./client";
import { ENV } from "@/config/env";

const PRODUCT_URL = ENV.PRODUCT_API_URL.replace(/\/$/, "");

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<{ image_url: string }>(
    `${PRODUCT_URL}/upload-image/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.image_url;
}