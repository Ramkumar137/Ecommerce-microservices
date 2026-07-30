import { createFileRoute } from "@tanstack/react-router";
import AdminUsersPage from "@/pages/admin/Users";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsersPage,
});
