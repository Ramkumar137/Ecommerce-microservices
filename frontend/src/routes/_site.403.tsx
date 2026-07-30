import { createFileRoute } from "@tanstack/react-router";
import Forbidden from "@/pages/errors/Forbidden";

export const Route = createFileRoute("/_site/403")({
  component: Forbidden,
});
