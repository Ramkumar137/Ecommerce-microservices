import { createFileRoute } from "@tanstack/react-router";
import Orders from "@/pages/customer/Orders";

export const Route = createFileRoute("/_site/orders")({
  head: () => ({ meta: [{ title: "Your orders — Northline" }] }),
  component: Orders,
});
