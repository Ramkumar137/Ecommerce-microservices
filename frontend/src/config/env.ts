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

export const ENV = {
  AUTH_API_URL: getEnvVar(
    "VITE_AUTH_API_URL",
    "https://ivr80tsx18.execute-api.ap-southeast-1.amazonaws.com/api/v1/auth"
  ),
  PRODUCT_API_URL: getEnvVar(
    "VITE_PRODUCT_API_URL",
    "https://ozqkz0sa3j.execute-api.ap-southeast-1.amazonaws.com/api/v1/products"
  ),
  INVENTORY_API_URL: getEnvVar(
    "VITE_INVENTORY_API_URL",
    "https://nj6zjlwffi.execute-api.ap-southeast-1.amazonaws.com/api/v1/inventory"
  ),
  CART_API_URL: getEnvVar(
    "VITE_CART_API_URL",
    "https://7tzmxy8va0.execute-api.ap-southeast-1.amazonaws.com/api/v1/cart"
  ),
  ORDER_API_URL: getEnvVar(
    "VITE_ORDER_API_URL",
    "https://cnslsh1jye.execute-api.ap-southeast-1.amazonaws.com/api/v1/orders"
  ),
  PAYMENT_API_URL: getEnvVar(
    "VITE_PAYMENT_API_URL",
    "https://l6ae8rtgsh.execute-api.ap-southeast-1.amazonaws.com/api/v1/payments"
  ),
  ANALYTICS_API_URL: getEnvVar(
    "VITE_ANALYTICS_API_URL",
    "http://127.0.0.1:8000/api/v1/analytics"
  ),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  MAX_RETRIES: Number(import.meta.env.VITE_MAX_RETRIES) || 2,
};
