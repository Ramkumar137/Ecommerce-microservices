import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart, formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Tag, Eye, Heart } from "lucide-react";
import { ProductQuickViewModal } from "@/components/common/ProductQuickViewModal";
import type { Product } from "@/types/product";

function getDiscountPercent(price: number): number | null {
  if (price > 200) return 20;
  if (price > 100) return 15;
  if (price > 50) return 10;
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, openGuestAuthModal } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const productId = String(product.product_id || (product as any).id || "");
  const isWishlisted = isInWishlist(productId);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };
  const outOfStock = Number(product.stock) === 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) < 10;
  const discount = getDiscountPercent(product.price);
  const originalPrice = discount ? +(product.price / (1 - discount / 100)).toFixed(2) : null;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openGuestAuthModal();
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add products to cart.");
      return;
    }

    try {
      setAdding(true);
      await add(product);
      toast.success(`Added ${product.name} to cart`);
    } catch {
      // Handled in cart context
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20">
        <div
          onClick={handleCardClick}
          className="relative block overflow-hidden bg-surface cursor-pointer"
          style={{ height: "200px" }}
        >
          <img
            src={
              product.image_url ||
              `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`
            }
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Quick view hover badge */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md backdrop-blur">
              <Eye className="size-3.5 text-primary" /> Quick View
            </span>
          </div>

          {/* Discount Badge */}
          {discount && !outOfStock && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Tag className="size-2.5" /> -{discount}%
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute right-2 top-2 z-20 grid size-7.5 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-xs transition-transform hover:scale-110"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`size-4 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            />
          </button>

          {/* Low Stock Badge */}
          {lowStock && !outOfStock && (
            <span className="absolute left-2 bottom-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              Only {product.stock} left
            </span>
          )}

          {/* Out of Stock Overlay */}
          {outOfStock && (
            <div className="absolute inset-0 grid place-items-center bg-background/75 backdrop-blur-[1px]">
              <span className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-3.5">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{product.brand}</span>
              <span>·</span>
              <span>{product.category}</span>
            </div>

            <div onClick={handleCardClick} className="mt-1.5 block cursor-pointer">
              <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                {product.name}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
              {originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <Button
              size="sm"
              disabled={outOfStock || adding || isAdmin}
              title={isAdmin ? "Admins cannot add products to cart" : undefined}
              onClick={handleAddToCart}
              className="gap-1.5 text-xs"
            >
              {adding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="size-3.5" />
              )}
              {adding ? "Adding…" : isAdmin ? "Restricted" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Centered Popup Modal */}
      <ProductQuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
