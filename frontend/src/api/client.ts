import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "@/utils/storage";
import { ENV } from "@/config/env";

/**
 * Authenticated Axios Client Instance for Microservices
 */
export const apiClient = axios.create({
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach Access Token securely
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Token Refresh & Automatic Retry handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        storage.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authUrl = ENV.AUTH_API_URL.replace(/\/$/, "");
        const response = await axios.post<{ access_token: string }>(
          `${authUrl}/refresh/`,
          { refresh_token: refreshToken },
          { timeout: ENV.API_TIMEOUT }
        );

        const newAccessToken = response.data.access_token;
        storage.setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        storage.clear();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Exponential Backoff Retry mechanism for network errors / 5xx server errors
    const isNetworkOrServerError =
      !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (isNetworkOrServerError) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (originalRequest._retryCount < ENV.MAX_RETRIES) {
        originalRequest._retryCount += 1;
        const delay = Math.pow(2, originalRequest._retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;