import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ordersApi } from "@/api/orders";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertCircle,
  RefreshCw,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TrackOrderModal } from "@/components/common/TrackOrderModal";
import { toast } from "sonner";
import type { Order } from "@/types/order";

export function getItemPricing(it: any) {
  const qty = Math.max(1, Number(it?.quantity || it?.qty || 1));
  const rawPrice = it?.price ?? it?.unit_price ?? it?.unitPrice ?? it?.product?.price ?? it?.product_price ?? it?.cost;
  const rawTotal = it?.total_price ?? it?.totalPrice ?? it?.total_amount ?? it?.totalAmount ?? it?.subtotal;

  let unitPrice: number | null = null;
  let itemTotal: number | null = null;

  if (rawPrice !== undefined && rawPrice !== null && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0) {
    unitPrice = Number(rawPrice);
  } else if (rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal)) && Number(rawTotal) > 0 && qty > 0) {
    unitPrice = Number(rawTotal) / qty;
  }

  if (rawTotal !== undefined && rawTotal !== null && !isNaN(Number(rawTotal)) && Number(rawTotal) > 0) {
    itemTotal = Number(rawTotal);
  } else if (unitPrice !== null) {
    itemTotal = unitPrice * qty;
  }

  const finalUnitPrice = unitPrice || 0;
  const finalItemTotal = itemTotal || finalUnitPrice * qty;

  return {
    quantity: qty,
    unitPrice: finalUnitPrice,
    itemTotal: finalItemTotal,
    formattedUnitPrice: formatPrice(finalUnitPrice),
    formattedItemTotal: formatPrice(finalItemTotal),
    displayText: `${formatPrice(finalUnitPrice)} × ${qty} = ${formatPrice(finalItemTotal)}`,
  };
}

export function formatFriendlyDate(dateStr?: string): string {
  if (!dateStr) return "Recent";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recent";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (targetDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderCard({
  order: o,
  isLatest,
  itemCount,
  orderDate,
  onCancelOrder,
}: {
  order: Order;
  isLatest: boolean;
  itemCount: number;
  orderDate: string;
  onCancelOrder: (orderId: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(isLatest);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const statusUpper = String(o.status || "").toUpperCase().trim();
  const isCancelled = statusUpper === "CANCELLED" || statusUpper === "REJECTED";
  const canCancel = !isCancelled && statusUpper !== "DELIVERED" && statusUpper !== "SHIPPED";

  const handleConfirmCancel = async () => {
    try {
      setCancelling(true);
      await onCancelOrder(o.order_id);
      setCancelModalOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card shadow-soft transition-all duration-200 hover:shadow-elevated ${
        isLatest ? "ring-2 ring-primary/40 border-primary/50" : ""
      }`}
    >
      {/* Header — always visible */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="uppercase tracking-wider text-muted-foreground font-medium">Order ID</p>
              {isLatest && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                  NEWEST
                </span>
              )}
            </div>
            <p className="mt-0.5 font-mono font-semibold text-foreground">{o.order_id}</p>
          </div>

          <div>
            <p className="uppercase tracking-wider text-muted-foreground font-medium">Placed</p>
            <p className="mt-0.5 font-medium text-foreground">{orderDate}</p>
          </div>

          <div>
            <p className="uppercase tracking-wider text-muted-foreground font-medium">Total Amount</p>
            <p className="mt-0.5 font-semibold text-foreground">{formatPrice(Number(o.total_amount || 0))}</p>
          </div>
        </div>

        {/* Status Badge & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={o.status as any} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrackingModal(true)}
            className="h-8 text-xs gap-1.5 font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
          >
            <MapPin className="size-3.5" />
            Track Order
          </Button>

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              Cancel Order
            </Button>
          )}

          {itemCount > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse items" : "Expand items"}
            >
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </button>
          )}
        </div>
      </div>

      {/* Centered Track Order Popup Modal with Vertical Stepper */}
      <TrackOrderModal
        order={o}
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
      />

      {/* Collapsible items */}
      {expanded && Array.isArray(o.items) && o.items.length > 0 && (
        <div className="border-t px-5 pb-5 pt-4">
          <ul className="divide-y rounded-lg border bg-surface px-3 py-1">
            {o.items.map((it: any, i: number) => {
              const pricing = getItemPricing(it);
              return (
                <li key={i} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {it.image_url && (
                      <img src={it.image_url} alt={it.product_name || ""} className="size-8 rounded-md border object-cover shrink-0" />
                    )}
                    <span className="truncate font-medium text-foreground">
                      {it.product_name || `Product #${it.product_id}`}
                    </span>
                    <span className="shrink-0 text-muted-foreground font-mono">× {pricing.quantity}</span>
                  </div>
                  <span className="ml-4 shrink-0 font-semibold text-foreground">{pricing.displayText}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to="/products">Buy again</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order #{o.order_id}</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelling}>
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Cancelling…
                </span>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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

  async function handleCancelOrder(orderId: string) {
    try {
      await ordersApi.updateStatus(orderId, { status: "CANCELLED" });
      toast.success(`Order #${orderId} has been cancelled.`);
      await loadOrders();
    } catch (err: any) {
      toast.error("Failed to cancel order. Please try again or contact support.");
    }
  }

  // Unauthenticated view
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

  // Sort orders newest first at TOP
  const sortedOrders = [...userOrders].sort((a, b) => {
    const rawA = a.created_at || (a as any).placed_at || (a as any).date;
    const rawB = b.created_at || (b as any).placed_at || (b as any).date;

    const timeA = rawA ? new Date(rawA).getTime() : 0;
    const timeB = rawB ? new Date(rawB).getTime() : 0;

    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;

    return timeB - timeA;
  });

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
      ) : sortedOrders.length === 0 ? (
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
          {sortedOrders.map((o, idx) => {
            const isLatest = idx === 0;
            const itemCount = Array.isArray(o.items) ? o.items.length : 0;
            const orderDate = formatFriendlyDate(o.created_at || (o as any).placed_at || (o as any).date);
            return (
              <OrderCard
                key={o.order_id}
                order={o}
                isLatest={isLatest}
                itemCount={itemCount}
                orderDate={orderDate}
                onCancelOrder={handleCancelOrder}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
