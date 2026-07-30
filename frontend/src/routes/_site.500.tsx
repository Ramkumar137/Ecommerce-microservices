import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/pages/errors/ServerError";

export const Route = createFileRoute("/_site/500")({
  component: ServerError,
});
