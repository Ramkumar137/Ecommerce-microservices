import { createFileRoute } from "@tanstack/react-router";
import AnalyticsPage from "@/pages/Analytics";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});
