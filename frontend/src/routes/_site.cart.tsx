import { createFileRoute } from "@tanstack/react-router";
import Cart from "@/pages/customer/Cart";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({ meta: [{ title: "Cart — Northline" }] }),
  component: Cart,
});
