import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { storage } from "@/utils/storage";
import { isJwtExpired } from "@/utils/session";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const token = storage.getAccessToken();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  if (!isAuthenticated || !token || isJwtExpired(token)) {
    return <Navigate to="/auth/login" search={{ redirect: currentPath }} replace />;
  }

  return <>{children}</>;
}
