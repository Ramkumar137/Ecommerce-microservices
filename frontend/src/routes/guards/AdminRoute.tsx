import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground">Verifying admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/admin";
    const safeRedirect = currentPath.startsWith("/auth") ? "/admin" : currentPath;
    return <Navigate to="/auth/login" search={{ redirect: safeRedirect }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
