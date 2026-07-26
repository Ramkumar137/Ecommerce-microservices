import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/customer/Settings";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

export const Route = createFileRoute("/_site/settings")({
  head: () => ({ meta: [{ title: "Settings — HeisenFlow" }] }),
  component: () => (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  ),
});
