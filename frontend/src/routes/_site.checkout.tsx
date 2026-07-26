import { createFileRoute } from "@tanstack/react-router";
import Checkout from "@/pages/customer/Checkout";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

export const Route = createFileRoute("/_site/checkout")({
  head: () => ({ meta: [{ title: "Checkout — HeisenFlow" }] }),
  component: () => (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  ),
});
