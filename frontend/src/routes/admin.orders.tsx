import { createFileRoute } from "@tanstack/react-router";
import AdminOrders from "@/pages/admin/Orders";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: AdminOrders,
});
