import React, { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { toast } from "sonner";

interface WishlistContextType {
  items: Product[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "heisenflow_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save wishlist to storage", e);
      }
    }
  }, [items]);

  const isInWishlist = (productId: string): boolean => {
    const targetId = String(productId);
    return items.some((p) => String(p.product_id || (p as any).id) === targetId);
  };

  const toggleWishlist = (product: Product) => {
    const pid = String(product.product_id || (product as any).id);
    if (isInWishlist(pid)) {
      setItems((prev) => prev.filter((p) => String(p.product_id || (p as any).id) !== pid));
      toast.info(`Removed ${product.name} from Wishlist`);
    } else {
      setItems((prev) => [product, ...prev]);
      toast.success(`Saved ${product.name} to Wishlist ❤️`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const pid = String(productId);
    const target = items.find((p) => String(p.product_id || (p as any).id) === pid);
    setItems((prev) => prev.filter((p) => String(p.product_id || (p as any).id) !== pid));
    if (target) {
      toast.info(`Removed ${target.name} from Wishlist`);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
