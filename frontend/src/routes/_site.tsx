import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/layouts/SiteLayout";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});
