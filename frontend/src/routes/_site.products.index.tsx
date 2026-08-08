import { createFileRoute } from "@tanstack/react-router";
import Products from "@/pages/customer/Products";

export const Route = createFileRoute("/_site/products/")({
  head: () => ({
    meta: [
      { title: "Shop all products — HeisenFlow" },
      { name: "description", content: "Browse premium electronics, wearables and accessories." },
    ],
  }),
  component: Products,
});
