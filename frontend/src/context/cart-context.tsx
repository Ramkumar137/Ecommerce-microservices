import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cartApi } from "@/api/cart";
import { productsService } from "@/api/products";
import { useAuth } from "./auth-context";
import { GuestAuthModal } from "@/components/common/GuestAuthModal";
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
  guestAuthModalOpen: boolean;
  openGuestAuthModal: () => void;
  closeGuestAuthModal: () => void;
  add: (product: Product, qty?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "commerce.cart.v1";

// Helper to reliably extract and compare product IDs
function getProductId(product: any): string {
  if (!product) return "";
  return String(product.product_id || product.id || product._id || "").trim();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [guestAuthModalOpen, setGuestAuthModalOpen] = useState(false);

  const openGuestAuthModal = useCallback(() => setGuestAuthModalOpen(true), []);
  const closeGuestAuthModal = useCallback(() => setGuestAuthModalOpen(false), []);

  // Set to track in-flight removal requests to prevent duplicate calls
  const pendingRemovalsRef = useRef<Set<string>>(new Set());

  // Derive user identity key for cart isolation
  const userId = useMemo(() => {
    if (!user) return "";
    return String(user.user_id || (user as any).id || user.email || "").trim();
  }, [user]);

  const storageKey = useMemo(() => {
    if (isAuthenticated && userId) {
      return `commerce.cart.user_${userId}`;
    }
    return "commerce.cart.guest";
  }, [isAuthenticated, userId]);

  // 1. Reset items when unauthenticated (Wait for authLoading to complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        setItems([]);
      }
    setHydrated(true);
  }, [authLoading, isAuthenticated]);

  // 2. Backend Cart Synchronization (getCart) - Backend as single source of truth
  const refreshCart = useCallback(async () => {
    if (authLoading || !isAuthenticated || isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const cartRes = await cartApi.getCart();
      console.log("[Cart Debug] Cart API Response:", cartRes);

      const data = Array.isArray(cartRes) ? cartRes : cartRes?.items;

      if (Array.isArray(data)) {
        // Hydrate full product metadata for all items in cart after reload
        const productDetailsMap = new Map<string, Product>();

        try {
          const productIds = data
            .map((i) => String(i.product_id || "").trim())
            .filter(Boolean);

          if (productIds.length > 0) {
            const fetchedProducts = await Promise.allSettled(
              productIds.map((id) => productsService.getProductById(id))
            );
            fetchedProducts.forEach((res) => {
              if (res.status === "fulfilled" && res.value) {
                const prod = res.value;
                const pid = String(prod.product_id || (prod as any).id || (prod as any)._id || "").trim();
                if (pid) {
                  productDetailsMap.set(pid, prod);
                }
              }
            });
          }
        } catch (e) {
          console.warn("[Cart Metadata Hydration] Failed to fetch product details:", e);
        }

        console.log("[Cart Debug] Hydrated product details map:", productDetailsMap);

        setItems((prevItems) => {
          const prevMap = new Map(
            prevItems.map((pi) => [getProductId(pi.product), pi.product])
          );

          return data.map((i) => {
            const pId = String(i.product_id || "").trim();
            const fetchedProduct = productDetailsMap.get(pId);
            const prevProduct = prevMap.get(pId);

            return {
              product: {
                product_id: pId,
                name: i.product_name || fetchedProduct?.name || prevProduct?.name || "Product",
                description: fetchedProduct?.description || prevProduct?.description || "",
                brand: fetchedProduct?.brand || prevProduct?.brand || "",
                category: fetchedProduct?.category || prevProduct?.category || "",
                price: Number(i.price ?? fetchedProduct?.price ?? prevProduct?.price ?? 0),
                stock: fetchedProduct?.stock ?? prevProduct?.stock ?? 99,
                image_url: i.image_url || fetchedProduct?.image_url || prevProduct?.image_url || "",
                is_active: fetchedProduct?.is_active ?? prevProduct?.is_active ?? true,
                created_at: fetchedProduct?.created_at || prevProduct?.created_at || "",
                updated_at: fetchedProduct?.updated_at || prevProduct?.updated_at || "",
              },
              quantity: Math.max(1, Number(i.quantity || 1)),
            };
          });
        });
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
  }, [authLoading, isAuthenticated, isAdmin]);

  // 3. Initial load & window focus / tab visibility change auto-resync (multi-device consistency)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdmin) {
      refreshCart();

      const handleFocusOrVisible = () => {
        if (document.visibilityState === "visible") {
          refreshCart();
        }
      };

      window.addEventListener("focus", handleFocusOrVisible);
      document.addEventListener("visibilitychange", handleFocusOrVisible);

      return () => {
        window.removeEventListener("focus", handleFocusOrVisible);
        document.removeEventListener("visibilitychange", handleFocusOrVisible);
      };
    }
  }, [authLoading, isAuthenticated, isAdmin, refreshCart]);

  // 4. Add Item (addItem) - Gated for guests & restricted for Admin users
  const add = useCallback(
    async (product: Product, qty = 1) => {
      if (!isAuthenticated) {
        setGuestAuthModalOpen(true);
        throw new Error("GUEST_AUTH_REQUIRED");
      }

      if (isAdmin) {
        toast.error("Admins cannot add products to cart.");
        throw new Error("ADMIN_RESTRICTED");
      }

      const targetProductId = getProductId(product);

      if (!targetProductId) {
        console.error("[Add To Cart Error] Missing product_id on product object:", product);
        toast.error("Invalid product ID");
        return;
      }

      const validQty = Math.max(1, Math.floor(qty));
      const normalizedProduct: Product = { ...product, product_id: targetProductId };
      let previousItems: CartItem[] = [];

      // Optimistic State Update
      setItems((prev) => {
        previousItems = prev;
        const found = prev.find((i) => getProductId(i.product) === targetProductId);
        if (found) {
          return prev.map((i) =>
            getProductId(i.product) === targetProductId
              ? { ...i, quantity: i.quantity + validQty }
              : i
          );
        }
        return [...prev, { product: normalizedProduct, quantity: validQty }];
      });

      if (isAuthenticated && !isAdmin) {
        try {
          await cartApi.addItem({
            product_id: targetProductId,
            quantity: Number(validQty),
          });
        } catch (err: any) {
          // Rollback local state on backend failure
          setItems(previousItems);
          const responseData = err?.response?.data;
          console.error("[Add to Cart Failed]", "Status:", err?.response?.status, "Data:", responseData);
          const errMsg =
            responseData?.error ||
            responseData?.detail ||
            responseData?.message ||
            "Failed to add item to backend cart";
          toast.error(errMsg);
          throw err;
        }
      }
    },
    [isAuthenticated, isAdmin]
  );

  // 5. Remove Item (removeItem) - Restricted for Admin users
  const remove = useCallback(
    async (productId: string) => {
      if (isAdmin) return;

      const cleanId = String(productId || "").trim();
      if (!cleanId || cleanId === "undefined" || cleanId === "null") {
        console.warn("[Remove Cart Item] Aborted: Invalid product ID", productId);
        return;
      }

      // Prevent duplicate/stale removal requests for the same product ID
      if (pendingRemovalsRef.current.has(cleanId)) {
        console.warn("[Remove Cart Item] Aborted: Removal already in progress for product ID", cleanId);
        return;
      }

      pendingRemovalsRef.current.add(cleanId);

      let previousItems: CartItem[] = [];
      setItems((prev) => {
        previousItems = prev;
        return prev.filter((i) => getProductId(i.product) !== cleanId);
      });

      if (isAuthenticated && !isAdmin) {
        try {
          await cartApi.removeItem(cleanId);
        } catch (err: any) {
          const status = err?.response?.status;
          const responseData = err?.response?.data;
          const errorMsg =
            typeof responseData === "string"
              ? responseData
              : responseData?.message || responseData?.error || responseData?.detail || "";

          const isNotFoundInBackend =
            status === 404 ||
            status === 403 ||
            (typeof errorMsg === "string" &&
              (errorMsg.toLowerCase().includes("not found") ||
                errorMsg.toLowerCase().includes("does not exist")));

          if (isNotFoundInBackend) {
            // Product is already not in backend cart! Do not rollback; sync state with backend.
            console.log("[Remove Cart Item] Backend confirms item not in cart, syncing state.");
            await refreshCart();
          } else {
            // Real network/server failure: rollback local state and notify user
            setItems(previousItems);
            console.error("[Remove Cart Item Error]", "Status:", status, "Data:", responseData);
            toast.error(errorMsg || "Failed to remove item from backend cart");
          }
        } finally {
          pendingRemovalsRef.current.delete(cleanId);
        }
      } else {
        pendingRemovalsRef.current.delete(cleanId);
      }
    },
    [isAuthenticated, isAdmin, refreshCart]
  );

  // 6. Update Quantity (updateQuantity, min=1) - Restricted for Admin users
  const setQty = useCallback(
    async (productId: string, qty: number) => {
      if (isAdmin) return;
      if (!isAuthenticated) {
        setGuestAuthModalOpen(true);
        return;
      }

      const cleanId = String(productId || "").trim();
      if (!cleanId || cleanId === "undefined" || cleanId === "null") return;

      const validQty = Math.max(1, Math.floor(qty));
      let previousItems: CartItem[] = [];

      setItems((prev) => {
        previousItems = prev;
        return prev.map((i) =>
          getProductId(i.product) === cleanId ? { ...i, quantity: validQty } : i
        );
      });

      if (isAuthenticated && !isAdmin) {
        try {
          await cartApi.updateQuantity(cleanId, { quantity: Number(validQty) });
        } catch (err: any) {
          const status = err?.response?.status;
          const responseData = err?.response?.data;
          const errorMsg =
            typeof responseData === "string"
              ? responseData
              : responseData?.message || responseData?.error || responseData?.detail || "";

          const isNotFoundInBackend =
            status === 404 ||
            status === 403 ||
            (typeof errorMsg === "string" &&
              (errorMsg.toLowerCase().includes("not found") ||
                errorMsg.toLowerCase().includes("does not exist")));

          if (isNotFoundInBackend) {
            console.log("[Update Cart Qty] Item state mismatch in backend, resyncing cart.");
            await refreshCart();
          } else {
            setItems(previousItems);
            console.error("[Update Cart Qty Error]", "Status:", status, "Data:", responseData);
            toast.error("Failed to update item quantity in backend cart");
            throw err;
          }
        }
      }
    },
    [isAuthenticated, isAdmin, refreshCart]
  );

  // 7. Clear Cart - Restricted for Admin users
  const clear = useCallback(async () => {
    if (isAdmin) return;

    let previousItems: CartItem[] = [];
    setItems((prev) => {
      previousItems = prev;
      return [];
    });

    if (isAuthenticated && !isAdmin) {
      try {
        await cartApi.clearCart();
      } catch (err: any) {
        setItems(previousItems);
        console.error("[Clear Cart Error]", "Status:", err?.response?.status, "Data:", err?.response?.data);
        toast.error("Failed to clear backend cart");
        throw err;
      }
    }
  }, [isAuthenticated, isAdmin]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((a, i) => a + i.quantity, 0);
    const subtotal = items.reduce((a, i) => a + (Number(i.quantity) * Number(i.product?.price || 0)), 0);
    return {
      items,
      count,
      subtotal,
      loading,
      error,
      guestAuthModalOpen,
      openGuestAuthModal,
      closeGuestAuthModal,
      add,
      remove,
      setQty,
      clear,
      refreshCart,
    };
  }, [items, loading, error, guestAuthModalOpen, openGuestAuthModal, closeGuestAuthModal, add, remove, setQty, clear, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <GuestAuthModal open={guestAuthModalOpen} onOpenChange={setGuestAuthModalOpen} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function formatPrice(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}


