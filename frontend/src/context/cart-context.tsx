import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartApi } from "@/api/cart";
import { useAuth } from "./auth-context";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  add: (product: Product, qty?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "commerce.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 1. Initial Load from LocalStorage for guest/offline UX
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // 2. Persist items to LocalStorage on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  // 3. Backend Cart Synchronization (getCart)
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const cartRes = await cartApi.getCart();
      if (cartRes && Array.isArray(cartRes.items)) {
        const fetchedItems: CartItem[] = cartRes.items.map((i) => ({
          product: {
            product_id: i.product_id,
            name: i.product_name || "Product",
            description: "",
            brand: "",
            category: "",
            price: Number(i.price || 0),
            stock: 99,
            image_url: i.image_url || "",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          quantity: i.quantity,
        }));
        setItems(fetchedItems);
      }
    } catch (err: any) {
      if (err?.response) {
        console.error("[Cart Sync Error]", "Status:", err.response.status, "Data:", err.response.data);
      }
      const errMsg = err?.response?.data?.message || err?.message || "Failed to sync cart with server";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated, refreshCart]);

  // 4. Add Item (addItem)
  const add = useCallback(
    async (product: Product, qty = 1) => {
      const targetProductId = product.product_id || (product as any).id || (product as any)._id;

      if (!targetProductId) {
        console.error("[Add To Cart Error] Missing product_id on product object:", product);
        toast.error("Invalid product ID");
        return;
      }

      const previousItems = [...items];
      const normalizedProduct: Product = { ...product, product_id: targetProductId };

      // Optimistic State Update
      setItems((prev) => {
        const found = prev.find((i) => (i.product.product_id || (i.product as any).id) === targetProductId);
        if (found) {
          return prev.map((i) =>
            (i.product.product_id || (i.product as any).id) === targetProductId
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { product: normalizedProduct, quantity: qty }];
      });

      if (isAuthenticated) {
        try {
          await cartApi.addItem({
            product_id: targetProductId,
            quantity: Number(qty),
          });
        } catch (err: any) {
          // Rollback local state on backend failure
          setItems(previousItems);
          const status = err?.response?.status;
          const responseData = err?.response?.data;
          console.error("[Add to Cart Failed]", "Status:", status, "Data:", responseData);
          const errMsg =
            responseData?.error ||
            responseData?.detail ||
            responseData?.message ||
            (responseData?.product_id ? `product_id: ${responseData.product_id.join(", ")}` : null) ||
            "Failed to add item to backend cart";
          toast.error(errMsg);
          throw err;
        }
      }
    },
    [items, isAuthenticated]
  );

  // 5. Remove Item (removeItem)
  const remove = useCallback(
    async (productId: string) => {
      const previousItems = [...items];
      setItems((prev) => prev.filter((i) => (i.product.product_id || (i.product as any).id) !== productId));

      if (isAuthenticated) {
        try {
          await cartApi.removeItem(productId);
        } catch (err: any) {
          setItems(previousItems);
          console.error("[Remove Cart Item Error]", "Status:", err?.response?.status, "Data:", err?.response?.data);
          toast.error("Failed to remove item from backend cart");
          throw err;
        }
      }
    },
    [items, isAuthenticated]
  );

  // 6. Update Quantity (updateQuantity)
  const setQty = useCallback(
    async (productId: string, qty: number) => {
      if (qty <= 0) {
        await remove(productId);
        return;
      }
      const previousItems = [...items];
      setItems((prev) =>
        prev.map((i) => ((i.product.product_id || (i.product as any).id) === productId ? { ...i, quantity: qty } : i))
      );

      if (isAuthenticated) {
        try {
          await cartApi.updateQuantity(productId, { quantity: Number(qty) });
        } catch (err: any) {
          setItems(previousItems);
          console.error("[Update Cart Qty Error]", "Status:", err?.response?.status, "Data:", err?.response?.data);
          toast.error("Failed to update item quantity in backend cart");
          throw err;
        }
      }
    },
    [items, isAuthenticated, remove]
  );

  // 7. Clear Cart
  const clear = useCallback(async () => {
    const previousItems = [...items];
    setItems([]);

    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (err: any) {
        setItems(previousItems);
        console.error("[Clear Cart Error]", "Status:", err?.response?.status, "Data:", err?.response?.data);
        toast.error("Failed to clear backend cart");
        throw err;
      }
    }
  }, [items, isAuthenticated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((a, i) => a + i.quantity, 0);
    const subtotal = items.reduce((a, i) => a + i.quantity * Number(i.product.price), 0);
    return { items, count, subtotal, loading, error, add, remove, setQty, clear, refreshCart };
  }, [items, loading, error, add, remove, setQty, clear, refreshCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function formatPrice(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}
