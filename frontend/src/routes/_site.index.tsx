import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/customer/Home";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Northline — Considered commerce" },
      { name: "description", content: "Shop premium electronics, wearables and accessories. Free shipping over $50." },
    ],
  }),
  component: Home,
});
