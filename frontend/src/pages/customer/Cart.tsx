import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, AlertCircle, RefreshCw, Tag, ArrowRight, ShieldAlert, Lock } from "lucide-react";
import { useCart, formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";

function getProductId(product: any): string {
  if (!product) return "";
  return String(product.product_id || product.id || product._id || "").trim();
}

function CartItemRow({
  item,
  onSetQty,
  onRemove,
}: {
  item: { product: any; quantity: number };
  onSetQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const pid = getProductId(item.product);
  const unitPrice = Number(item.product.price || 0);
  const rowTotal = unitPrice * item.quantity;

  const fallbackImg = `https://placehold.co/200x200?text=${encodeURIComponent(
    item.product.name || "Product"
  )}`;
  const pImg = !imgError && item.product.image_url ? item.product.image_url : fallbackImg;

  return (
    <li className="grid grid-cols-[80px_1fr] gap-4 p-4 sm:grid-cols-[100px_1fr_auto] sm:p-5 items-center hover:bg-muted/20 transition-colors">
      {/* Product Image */}
      <Link
        to="/products/$id"
        params={{ id: pid }}
        className="aspect-square overflow-hidden rounded-lg border bg-surface flex items-center justify-center shrink-0"
      >
        <img
          src={pImg}
          alt={item.product.name}
          onError={() => setImgError(true)}
          className="size-full object-cover transition-transform duration-200 hover:scale-105"
        />
      </Link>

      {/* Product Information & Controls */}
      <div className="min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {item.product.brand || item.product.category || "General"}
          </p>
          <Link
            to="/products/$id"
            params={{ id: pid }}
            className="mt-0.5 block truncate text-sm font-semibold hover:text-primary transition-colors"
          >
            {item.product.name}
          </Link>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
            {formatPrice(unitPrice)} <span className="text-[11px] text-muted-foreground font-normal">each</span>
          </p>
        </div>

        {/* Quantity Controls & Remove Button */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border bg-background shadow-xs">
            <button
              type="button"
              onClick={() => onSetQty(pid, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-semibold text-foreground select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onSetQty(pid, item.quantity + 1)}
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(pid)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <Trash2 className="size-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Row Total */}
      <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end border-t pt-2 sm:border-t-0 sm:pt-0">
        <span className="text-xs text-muted-foreground sm:hidden">Total:</span>
        <span className="text-base font-bold text-foreground">{formatPrice(rowTotal)}</span>
      </div>
    </li>
  );
}

function CartPage() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { items, subtotal, setQty, remove, clear, loading, error, refreshCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Persistence on Page Reload: Fetch cart from backend DB on mount & poll every 10s
  useEffect(() => {
    if (authLoading || !isAuthenticated || isAdmin) return;
    refreshCart();
    const interval = setInterval(() => {
      refreshCart();
    }, 10000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, isAdmin, refreshCart]);

  const shipping = subtotal > 4000 || subtotal === 0 ? 0 : 599;
  const tax = subtotal * 0.18;
  const discountAmount = subtotal * appliedDiscount;
  const total = Math.max(0, subtotal - discountAmount + shipping + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const code = promoCode.trim().toUpperCase();
    if (code === "SAVE10" || code === "DISCOUNT10") {
      setAppliedDiscount(0.1);
      toast.success("10% discount applied to cart!");
    } else if (code === "SAVE20") {
      setAppliedDiscount(0.2);
      toast.success("20% discount applied to cart!");
    } else {
      toast.error("Invalid discount code. Try SAVE10");
    }
  };

  // Block Cart page access for Admin users with clear UI message & Dashboard actions
  if (isAdmin) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-10">
        <PageHeader
          title="Shopping cart"
          description="Access restriction details"
        />
        <div className="mt-8">
          <EmptyState
            icon={ShieldAlert}
            title="Cart is not available for admin users."
            description="Admin accounts manage products, inventory, and system settings. Shopping cart and customer checkout features are restricted to customer accounts."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/admin">
                    Go to Admin Dashboard <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/products">View Products Catalog</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  // Guest view: Replace ENTIRE cart content with centered UI message card
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex min-h-[65vh] w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft text-center sm:p-10">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-7" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Sign in to view and manage your cart
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Please sign in or create an account to start adding items, view your shopping bag, and complete your purchase.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto font-medium px-6 gap-2">
              <Link to="/auth/login" search={{ redirect: "/cart" }}>
                Sign In <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="w-full sm:w-auto font-medium px-6">
              <Link to="/auth/register">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if ((loading || authLoading) && items.length === 0) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-10">
        <PageHeader title="Shopping cart" description="Loading your cart..." />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="h-72 rounded-xl border bg-card p-6 animate-pulse" />
          <div className="h-72 rounded-xl border bg-card p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Shopping cart"
          description={
            items.length > 0
              ? `${items.length} item${items.length === 1 ? "" : "s"} in your cart`
              : "Your cart is currently empty"
          }
        />

        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="self-start sm:self-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="mr-1.5 size-3.5" /> Clear cart
          </Button>
        )}
      </div>

      {/* Guest Authentication Prompt Banner */}
      {!isAuthenticated && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Sign in to save cart & checkout</h4>
              <p className="text-xs text-muted-foreground">Sign in or create an account to sync your cart across devices and proceed to checkout.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button asChild size="sm" className="h-9 text-xs font-semibold gap-1.5">
              <Link to="/auth/login">
                Sign In <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold">
              <Link to="/auth/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={refreshCart} className="gap-1.5 text-xs">
            <RefreshCw className="size-3" /> Retry
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Discover something you'll love from our curated product catalog."
            action={
              <Button asChild size="lg" className="gap-2">
                <Link to="/products">
                  Continue shopping <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Cart Items List */}
          <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
            <div className="border-b px-5 py-3.5 bg-muted/30 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item Details
              </span>
              <span className="text-xs text-muted-foreground">
                Total Items: <strong>{items.reduce((a, i) => a + i.quantity, 0)}</strong>
              </span>
            </div>
            <ul className="divide-y">
              {items.map((it) => (
                <CartItemRow
                  key={getProductId(it.product)}
                  item={it}
                  onSetQty={setQty}
                  onRemove={remove}
                />
              ))}
            </ul>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="h-fit rounded-xl border bg-card p-6 shadow-soft space-y-6">
            <h2 className="text-base font-semibold text-foreground">Order summary</h2>

            {/* Discount Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Promo code (e.g. SAVE10)"
                  className="h-10 pl-9 text-xs"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-10 px-3 text-xs font-semibold">
                Apply
              </Button>
            </form>

            {/* Pricing Breakdown */}
            <dl className="space-y-3 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-foreground">{formatPrice(subtotal)}</dd>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <dt>Discount ({appliedDiscount * 100}%)</dt>
                  <dd>-{formatPrice(discountAmount)}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium text-foreground">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated tax (18% GST)</dt>
                <dd className="font-medium text-foreground">{formatPrice(tax)}</dd>
              </div>
            </dl>

            <div className="flex justify-between border-t pt-4 text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-lg text-primary">{formatPrice(total)}</span>
            </div>

            {subtotal > 0 && subtotal < 4000 && (
              <p className="text-[11px] text-muted-foreground text-center bg-muted/40 py-2 px-3 rounded-lg border">
                Add <strong>{formatPrice(4000 - subtotal)}</strong> more for <strong>Free Shipping</strong>!
              </p>
            )}

            {isAuthenticated ? (
              <Button asChild size="lg" className="w-full h-11 text-sm font-semibold shadow-sm gap-2">
                <Link to="/checkout">
                  Proceed to checkout <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full h-11 text-sm font-semibold shadow-sm gap-2">
                <Link to="/auth/login">
                  Sign in to checkout <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}

            <Link
              to="/products"
              className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;

