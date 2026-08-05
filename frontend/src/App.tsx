import { RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { router } from "./router";

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
