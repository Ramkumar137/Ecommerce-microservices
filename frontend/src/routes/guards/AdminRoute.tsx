import type { ReactNode } from "react";
// Placeholder route guard for admin users.
export function AdminRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
