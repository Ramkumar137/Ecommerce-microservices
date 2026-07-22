import type { ReactNode } from "react";
// Placeholder route guard for authenticated users.
// Post-export, wrap children with react-router-dom's <Navigate /> when unauthenticated.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
