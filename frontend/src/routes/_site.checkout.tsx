import { createFileRoute } from "@tanstack/react-router";
import Checkout from "@/pages/customer/Checkout";

export const Route = createFileRoute("/_site/checkout")({
  head: () => ({ meta: [{ title: "Checkout — HeisenFlow" }] }),
  component: Checkout,
});
