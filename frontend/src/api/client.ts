import axios from "axios";

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------------
// Request Interceptor
// -------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------
// Response Interceptor
// -------------------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request");
      // Refresh token logic will be added later.
    }

    return Promise.reject(error);
  }
);

export default apiClient;