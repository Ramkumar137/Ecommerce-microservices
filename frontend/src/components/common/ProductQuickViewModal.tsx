import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice, useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { ShoppingCart, Check, ExternalLink, Loader2, Star, Eye, AlertCircle } from "lucide-react";
import type { Product } from "@/types/product";

export function ProductQuickViewModal({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { add, openGuestAuthModal } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const outOfStock = Number(product.stock) <= 0;
  const productId = String(product.product_id || (product as any).id || "");

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-2xl border bg-card shadow-2xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-surface overflow-hidden flex items-center justify-center p-6 border-b md:border-b-0 md:border-r">
            <img
              src={
                product.image_url ||
                `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              className="size-full object-cover max-h-[380px] rounded-xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Right: Details & Actions */}
          <div className="flex flex-col justify-between p-6 sm:p-8 space-y-5 bg-card">
            <DialogHeader className="space-y-1.5 text-left">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>{product.brand || "Brand"} • {product.category || "General"}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-baseline justify-between border-y py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {product.description || "High quality e-commerce product with fast shipping and 30-day warranty."}
            </p>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs font-medium">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  Out of stock
                </span>
              ) : Number(product.stock) < 5 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3.5" /> Only {product.stock} stocks left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" /> In stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                disabled={outOfStock || adding || isAdmin}
                onClick={handleAddToCart}
                className="w-full sm:flex-1 gap-2 font-semibold"
              >
                {adding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                {adding ? "Adding…" : isAdmin ? "Restricted" : "Add to Cart"}
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto gap-1.5 text-xs font-medium"
              >
                <Link to="/products/$id" params={{ id: productId }}>
                  Full Page <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
