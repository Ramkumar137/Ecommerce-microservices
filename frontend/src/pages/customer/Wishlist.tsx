import { Link } from "@tanstack/react-router";
import { useWishlist } from "@/context/wishlist-context";
import { useCart, formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function WishlistPage() {
  const { items, count, removeFromWishlist, clearWishlist } = useWishlist();
  const { add, openGuestAuthModal } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleMoveAllToCart = async () => {
    if (!isAuthenticated) {
      openGuestAuthModal();
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add items to cart.");
      return;
    }

    try {
      for (const item of items) {
        await add(item);
      }
      toast.success(`Moved ${count} items to cart!`);
    } catch {
      // Handled in cart context
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        title="My Wishlist"
        description={
          count === 1
            ? "1 saved product in your wishlist"
            : `${count} saved products in your wishlist`
        }
        actions={
          count > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearWishlist} className="gap-1.5 text-xs">
                <Trash2 className="size-3.5" /> Clear Wishlist
              </Button>
              <Button size="sm" onClick={handleMoveAllToCart} className="gap-1.5 text-xs font-semibold">
                <ShoppingBag className="size-3.5" /> Move All to Cart
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mt-6">
        {count === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save your favorite items here while browsing so you can easily find them later."
              action={
                <Button asChild size="lg" className="gap-2 font-semibold">
                  <Link to="/products">
                    Explore Products <ArrowRight className="size-4" />
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.product_id || (p as any).id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
