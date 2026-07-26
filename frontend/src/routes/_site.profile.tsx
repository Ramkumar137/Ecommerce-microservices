import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/pages/customer/Profile";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

export const Route = createFileRoute("/_site/profile")({
  head: () => ({ meta: [{ title: "Profile — HeisenFlow" }] }),
  component: () => (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  ),
});
