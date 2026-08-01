import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "@/utils/storage";
import { ENV } from "@/config/env";
import { handleSessionExpired, isJwtExpired } from "@/utils/session";
import { toast } from "sonner";

/**
 * Authenticated Axios Client Instance for Microservices
 */
export const apiClient = axios.create({
  timeout: ENV.API_TIMEOUT,
  withCredentials: true,
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

// 1. Request Interceptor: Pre-validate JWT Expiry, Attach Bearer Token & CSRF Token Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = storage.getAccessToken();

    // Fallback 1: Check sessionStorage if not found in localStorage
    if (!token && typeof sessionStorage !== "undefined") {
      token =
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("admin_access_token") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("jwt");
    }

    // Fallback 2: Check cookies if not found in storage
    if (!token && typeof document !== "undefined") {
      const cookieMatch = document.cookie.match(/(?:access_token|admin_access_token|token|jwt)=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        token = cookieMatch[1];
      }
    }

    // Strict validation: Ensure token is present, non-empty, and not literal "undefined" / "null" string
    const isValidToken =
      Boolean(token) &&
      typeof token === "string" &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== "";

    const refreshToken = storage.getRefreshToken();

    if (isValidToken && token) {
      // Pre-validate JWT expiry
      if (isJwtExpired(token) && (!refreshToken || isJwtExpired(refreshToken))) {
        handleSessionExpired();
        return Promise.reject(new axios.Cancel("Session expired"));
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        if (!config.headers["Content-Type"]) {
          config.headers["Content-Type"] = "application/json";
        }
      }
    } else if (config.headers && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // Attach Django CSRF Token if csrftoken cookie exists
    if (typeof document !== "undefined" && config.headers) {
      const match = document.cookie.match(/csrftoken=([^;]+)/);
      if (match && match[1]) {
        config.headers["X-CSRFToken"] = match[1];
      }
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers ? { Authorization: config.headers.Authorization } : {},
      data: config.data,
      withCredentials: config.withCredentials,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Token Refresh & Automatic Smooth Logout handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const responseData = error.response?.data as any;

    // Handle 401 Unauthorized token refresh
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken();
      if (!refreshToken || isJwtExpired(refreshToken)) {
        handleSessionExpired();
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
        handleSessionExpired();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden due to permission or scope restrictions (DO NOT LOGOUT ON 403; ONLY LOGOUT ON 401)
    if (status === 403) {
      console.error("[API 403 Error Detail]", {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        data: responseData,
      });

      // User notification for admin authorization issues
      if (typeof window !== "undefined") {
        toast.error("Admin access required", { id: "admin-access-required-toast" });
      }

      return Promise.reject(error);
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