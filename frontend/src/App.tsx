import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
