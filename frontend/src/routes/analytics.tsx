import { createFileRoute } from "@tanstack/react-router";
import AnalyticsPage from "@/pages/Analytics";
import AdminLayout from "@/layouts/AdminLayout";
import { AdminRoute } from "@/routes/guards/AdminRoute";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: () => (
    <AdminRoute>
      <AdminLayout>
        <AnalyticsPage />
      </AdminLayout>
    </AdminRoute>
  ),
});
