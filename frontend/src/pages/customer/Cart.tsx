import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useCart, formatPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

function CartPage() {
  const { items, subtotal, setQty, remove, loading, error, refreshCart } = useCart();
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading && items.length === 0) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-10">
        <PageHeader title="Shopping cart" description="Loading your cart..." />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="h-64 rounded-xl border bg-card p-6 animate-pulse" />
          <div className="h-64 rounded-xl border bg-card p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
      <PageHeader
        title="Shopping cart"
        description={`${items.length} item${items.length === 1 ? "" : "s"} in your cart`}
      />

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={refreshCart}>
            Retry
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Discover something you'll love from our product catalog."
            action={
              <Button asChild>
                <Link to="/products">Continue shopping</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border bg-card">
            <ul className="divide-y">
              {items.map((it) => {
                const pid = it.product.product_id;
                const pImg =
                  it.product.image_url ||
                  `https://placehold.co/200x200?text=${encodeURIComponent(it.product.name)}`;

                return (
                  <li
                    key={pid}
                    className="grid grid-cols-[80px_1fr] gap-4 p-4 sm:grid-cols-[100px_1fr_auto] sm:p-5"
                  >
                    <Link
                      to="/products/$id"
                      params={{ id: pid }}
                      className="aspect-square overflow-hidden rounded-lg border bg-surface"
                    >
                      <img src={pImg} alt={it.product.name} className="size-full object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {it.product.brand || it.product.category || "Item"}
                      </p>
                      <Link
                        to="/products/$id"
                        params={{ id: pid }}
                        className="mt-0.5 block truncate text-sm font-medium hover:text-primary"
                      >
                        {it.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(Number(it.product.price))}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-md border">
                          <button
                            onClick={() => setQty(pid, it.quantity - 1)}
                            className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{it.quantity}</span>
                          <button
                            onClick={() => setQty(pid, it.quantity + 1)}
                            className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(pid)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-start justify-end text-sm font-semibold sm:col-span-1">
                      {formatPrice(Number(it.product.price) * it.quantity)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-xl border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Order summary</h2>

            <div className="mt-4 flex gap-2">
              <Input placeholder="Discount code" className="h-10" />
              <Button variant="outline">Apply</Button>
            </div>

            <dl className="mt-6 space-y-2.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated tax</dt>
                <dd className="font-medium">{formatPrice(tax)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
            <Link
              to="/products"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
