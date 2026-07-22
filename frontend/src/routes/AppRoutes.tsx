// ============================================================================
// React Router DOM scaffold — READY TO ACTIVATE POST-EXPORT.
//
// This file is intentionally not imported by the running app. The project is
// currently running on TanStack Router inside the Lovable sandbox. Once you
// export the repo, replace the current router bootstrap with this component
// and delete the TanStack route wrappers under src/routes/*.tsx.
// ============================================================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SiteLayout from "@/layouts/SiteLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Home from "@/pages/customer/Home";
import Products from "@/pages/customer/Products";
import ProductDetails from "@/pages/customer/ProductDetails";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import Orders from "@/pages/customer/Orders";
import OrderSuccess from "@/pages/customer/OrderSuccess";
import Profile from "@/pages/customer/Profile";
import Settings from "@/pages/customer/Settings";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import Inventory from "@/pages/admin/Inventory";
import AdminOrders from "@/pages/admin/Orders";
import Payments from "@/pages/admin/Payments";
import AdminSettings from "@/pages/admin/Settings";

import NotFound from "@/pages/errors/NotFound";
import Forbidden from "@/pages/errors/Forbidden";
import ServerError from "@/pages/errors/ServerError";

import { ProtectedRoute } from "./guards/ProtectedRoute";
import { AdminRoute } from "./guards/AdminRoute";
import { PublicRoute } from "./guards/PublicRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>

        <Route path="auth" element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="403" element={<Forbidden />} />
        <Route path="500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
