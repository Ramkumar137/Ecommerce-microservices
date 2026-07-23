import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config/env";

/**
 * Public Axios Client Instance
 * Used for unauthenticated endpoints with timeout & exponential backoff retry mechanism.
 */
export const publicClient = axios.create({
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor: Exponential backoff retry mechanism for 5xx/network errors
publicClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isNetworkOrServerError =
      !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (isNetworkOrServerError) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (originalRequest._retryCount < ENV.MAX_RETRIES) {
        originalRequest._retryCount += 1;
        const delay = Math.pow(2, originalRequest._retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return publicClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default publicClient;