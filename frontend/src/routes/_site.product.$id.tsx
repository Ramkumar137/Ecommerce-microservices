import { createFileRoute } from "@tanstack/react-router";
import ProductDetails from "@/pages/customer/ProductDetails";

export const Route = createFileRoute("/_site/product/$id")({
  head: () => ({
    meta: [
      { title: "Product Details — HeisenFlow" },
      { name: "description", content: "View product details, pricing, and availability." },
    ],
  }),
  component: ProductDetails,
});
