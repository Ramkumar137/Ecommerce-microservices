import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [
    TanStackRouterVite({
      routeFileIgnorePrefix: "-",
      routeFileIgnorePattern: "guards",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      "/api/v1/auth": {
        target: "https://ivr80tsx18.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/products": {
        target: "https://ozqkz0sa3j.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/inventory": {
        target: "https://nj6zjlwffi.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/cart": {
        target: "https://7tzmxy8va0.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/orders": {
        target: "https://cnslsh1jye.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/payments": {
        target: "https://l6ae8rtgsh.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/analytics": {
        target: "https://h8bykrlcg7.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/notifications": {
        target: "https://3dsvsjyvik.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
