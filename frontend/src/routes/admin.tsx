import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/layouts/AdminLayout";
import { AdminRoute } from "@/routes/guards/AdminRoute";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  ),
});
