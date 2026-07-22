import { createFileRoute } from "@tanstack/react-router";
import AdminProducts from "@/pages/admin/Products";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProducts,
});
