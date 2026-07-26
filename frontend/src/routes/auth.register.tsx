import { createFileRoute } from "@tanstack/react-router";
import Register from "@/pages/auth/Register";
import { PublicRoute } from "@/routes/guards/PublicRoute";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — HeisenFlow" }] }),
  component: () => (
    <PublicRoute>
      <Register />
    </PublicRoute>
  ),
});
