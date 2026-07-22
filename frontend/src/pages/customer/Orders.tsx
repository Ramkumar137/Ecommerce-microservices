import { Link } from "@tanstack/react-router";
import { orders } from "@/lib/mock-data";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { formatPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title="Your orders" description="Track, return, or reorder your recent purchases." />
      <div className="mt-8 space-y-4">
        {orders.slice(0, 5).map((o) => (
          <div key={o.id} className="rounded-xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elevated">
            <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div><p className="uppercase tracking-wider text-muted-foreground">Order</p><p className="mt-0.5 font-mono font-semibold text-foreground">{o.id}</p></div>
                <div><p className="uppercase tracking-wider text-muted-foreground">Placed</p><p className="mt-0.5 font-medium text-foreground">{o.date}</p></div>
                <div><p className="uppercase tracking-wider text-muted-foreground">Total</p><p className="mt-0.5 font-semibold text-foreground">{formatPrice(o.total)}</p></div>
              </div>
              <div className="flex gap-2">
                <OrderStatusBadge status={o.status} />
                <PaymentStatusBadge status={o.payment} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{o.items} item{o.items === 1 ? "" : "s"}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Track</Button>
                <Button asChild variant="outline" size="sm"><Link to="/products">Buy again</Link></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
