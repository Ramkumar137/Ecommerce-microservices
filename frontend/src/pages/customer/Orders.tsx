import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ordersApi } from "@/api/orders";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Package, AlertCircle, RefreshCw, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/types/order";

function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.list();
      setUserOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to load orders. Please try again.";
      setError(errorMessage);
      toast.error("Failed to load your order history");
    } finally {
      setLoading(false);
    }
  }

  // Render Guest Sign-In Prompt Card when unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <PageHeader
          title="Your orders"
          description="Authentication required to view order history"
        />
        <div className="mt-8">
          <EmptyState
            icon={Lock}
            title="Sign in to view your orders"
            description="Please log in or create an account to view your order history, track shipments, and manage past purchases."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth/login">
                    Sign In <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/auth/register">Create Account</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
      <PageHeader
        title="Your orders"
        description="Track, review, or reorder your recent purchases."
      />

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load orders"
            description={error}
            action={
              <Button onClick={loadOrders} variant="default">
                <RefreshCw className="mr-1.5 size-4" /> Try Again
              </Button>
            }
          />
        </div>
      ) : userOrders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will appear here."
            action={
              <Button asChild>
                <Link to="/products">Start shopping</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((o) => {
            const itemCount = Array.isArray(o.items) ? o.items.length : 0;
            const orderDate = o.created_at
              ? new Date(o.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            return (
              <div
                key={o.order_id}
                className="rounded-xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elevated"
              >
                {/* Header */}
                <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div>
                      <p className="uppercase tracking-wider text-muted-foreground">Order ID</p>
                      <p className="mt-0.5 font-mono font-semibold text-foreground">{o.order_id}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wider text-muted-foreground">Placed</p>
                      <p className="mt-0.5 font-medium text-foreground">{orderDate}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wider text-muted-foreground">Total Amount</p>
                      <p className="mt-0.5 font-semibold text-foreground">
                        {formatPrice(Number(o.total_amount))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <OrderStatusBadge status={o.status as any} />
                  </div>
                </div>

                {/* Items Breakdown */}
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Order Items ({itemCount})
                    </p>
                    <ul className="divide-y rounded-lg border bg-surface px-3 py-1">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {it.image_url && (
                              <img
                                src={it.image_url}
                                alt={it.product_name || ""}
                                className="size-8 rounded object-cover border"
                              />
                            )}
                            <span className="truncate font-medium text-foreground">
                              {it.product_name || `Product #${it.product_id}`}
                            </span>
                            <span className="text-muted-foreground font-mono">× {it.quantity}</span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatPrice(Number(it.total_price || (it.price ? it.price * it.quantity : 0)))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Action */}
                <div className="mt-4 flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {itemCount} item{itemCount === 1 ? "" : "s"} total
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/products">Buy again</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
