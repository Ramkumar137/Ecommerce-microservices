import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/auth/Login";
import { PublicRoute } from "@/routes/guards/PublicRoute";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — HeisenFlow" }] }),
  component: () => (
    <PublicRoute>
      <Login />
    </PublicRoute>
  ),
});
