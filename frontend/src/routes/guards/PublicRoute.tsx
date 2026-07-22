import type { ReactNode } from "react";
// Placeholder route guard for public (unauthenticated) pages.
export function PublicRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
