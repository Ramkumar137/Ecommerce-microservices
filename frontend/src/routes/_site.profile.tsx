import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/pages/customer/Profile";

export const Route = createFileRoute("/_site/profile")({
  head: () => ({ meta: [{ title: "Profile — Northline" }] }),
  component: Profile,
});
