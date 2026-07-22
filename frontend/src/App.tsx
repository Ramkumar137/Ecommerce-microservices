// Post-export entry point. Not used by the current TanStack Start runtime.
// After exporting the project, point main.tsx at this component.
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes/AppRoutes";
import { authApi } from "@/api";

console.log(authApi);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
