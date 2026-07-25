import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/customer/Settings";

export const Route = createFileRoute("/_site/settings")({
  head: () => ({ meta: [{ title: "Settings — HeisenFlow" }] }),
  component: Settings,
});
