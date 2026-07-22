import { createFileRoute } from "@tanstack/react-router";
import OrderSuccess from "@/pages/customer/OrderSuccess";

export const Route = createFileRoute("/_site/order-success")({
  head: () => ({ meta: [{ title: "Order confirmed — Northline" }] }),
  component: OrderSuccess,
});
