/**
 * Environment Configuration with Fallback Defaults & Validation
 */
const getEnvVar = (key: string, defaultValue: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    return defaultValue;
  }
  return value;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export const ENV = {
  AUTH_API_URL: getEnvVar(
    "VITE_AUTH_API_URL",
    baseUrl ? `${baseUrl}/auth` : "https://ivr80tsx18.execute-api.ap-southeast-1.amazonaws.com/api/v1/auth"
  ),
  PRODUCT_API_URL: getEnvVar(
    "VITE_PRODUCT_API_URL",
    baseUrl ? `${baseUrl}/products` : "https://ozqkz0sa3j.execute-api.ap-southeast-1.amazonaws.com/api/v1/products"
  ),
  INVENTORY_API_URL: getEnvVar(
    "VITE_INVENTORY_API_URL",
    baseUrl ? `${baseUrl}/inventory` : "https://nj6zjlwffi.execute-api.ap-southeast-1.amazonaws.com/api/v1/inventory"
  ),
  CART_API_URL: getEnvVar(
    "VITE_CART_API_URL",
    baseUrl ? `${baseUrl}/cart` : "https://7tzmxy8va0.execute-api.ap-southeast-1.amazonaws.com/api/v1/cart"
  ),
  ORDER_API_URL: getEnvVar(
    "VITE_ORDER_API_URL",
    baseUrl ? `${baseUrl}/orders` : "https://cnslsh1jye.execute-api.ap-southeast-1.amazonaws.com/api/v1/orders"
  ),
  PAYMENT_API_URL: getEnvVar(
    "VITE_PAYMENT_API_URL",
    baseUrl ? `${baseUrl}/payments` : "https://l6ae8rtgsh.execute-api.ap-southeast-1.amazonaws.com/api/v1/payments"
  ),
  ANALYTICS_API_URL: getEnvVar(
    "VITE_ANALYTICS_API_URL",
    baseUrl ? `${baseUrl}/analytics` : "https://h8bykrlcg7.execute-api.ap-southeast-1.amazonaws.com/api/v1/analytics"
  ),
  NOTIFICATION_API_URL: getEnvVar(
    "VITE_NOTIFICATION_API_URL",
    baseUrl ? `${baseUrl}/notifications` : "https://3dsvsjyvik.execute-api.ap-southeast-1.amazonaws.com/api/v1/notifications"
  ),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  MAX_RETRIES: Number(import.meta.env.VITE_MAX_RETRIES) || 2,
};
