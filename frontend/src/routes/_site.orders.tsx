import { createFileRoute } from "@tanstack/react-router";
import Orders from "@/pages/customer/Orders";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

export const Route = createFileRoute("/_site/orders")({
  head: () => ({ meta: [{ title: "Your orders — HeisenFlow" }] }),
  component: () => (
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  ),
});
