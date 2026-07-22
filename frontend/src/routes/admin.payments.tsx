import { createFileRoute } from "@tanstack/react-router";
import Payments from "@/pages/admin/Payments";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: Payments,
});
