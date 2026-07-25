import { Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Package, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/api/orders";
import { formatPrice } from "@/context/cart-context";
import { getItemPricing } from "./Orders";
import type { Order } from "@/types/order";

function OrderSuccess() {
  const search = useSearch({ strict: false }) as { orderId?: string };
  const orderId = search.orderId || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await ordersApi.get(orderId);
        setOrder(data);
      } catch {
        // Fallback to basic orderId display if details loading fails
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-8" />
      </div>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Thank you for your order!</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        We've received your order and payment. Your order is now being processed.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-6 text-left shadow-soft">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">{orderId || "N/A"}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-current" /> {order?.status || "CONFIRMED"}
          </span>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Summary</p>
            <ul className="divide-y rounded-lg border bg-surface px-3">
              {order.items?.map((it, idx) => {
                const pricing = getItemPricing(it);
                return (
                  <li key={idx} className="flex justify-between py-2.5 text-sm">
                    <span className="font-medium">
                      {it.product_name || `Product #${it.product_id}`} × {pricing.quantity}
                    </span>
                    <span className="font-medium text-foreground">{pricing.displayText}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between pt-2 text-sm font-semibold">
              <span>Total Paid</span>
              <span>{formatPrice(Number(order.total_amount || 0))}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-foreground" />
            <div>
              <p className="text-sm font-medium">Confirmation sent</p>
              <p className="text-xs text-muted-foreground">Check your email for status notifications.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 size-4 text-foreground" />
            <div>
              <p className="text-sm font-medium">Shipping soon</p>
              <p className="text-xs text-muted-foreground">Track status in your account dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="default">
          <Link to="/orders">
            View my orders <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default OrderSuccess;
