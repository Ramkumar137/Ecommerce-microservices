import { Link } from "@tanstack/react-router";
import { DollarSign, ShoppingBag, Users, Package, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { orders, revenueSeries, products } from "@/lib/mock-data";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

function AdminDashboard() {
  const max = Math.max(...revenueSeries.map((r) => r.v));
  const lowStock = products.filter((p) => p.stock < 15).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance."
        actions={<><Button variant="outline">Export</Button><Button>New product</Button></>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value="$42,180" delta={12.4} icon={DollarSign} />
        <StatCard label="Orders" value="1,284" delta={8.2} icon={ShoppingBag} />
        <StatCard label="Customers" value="892" delta={-2.1} icon={Users} />
        <StatCard label="Products" value={products.length.toString()} delta={4.6} icon={Package} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-xl border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Last 7 months</p>
            </div>
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
          <div className="mt-6 flex h-52 items-end gap-3">
            {revenueSeries.map((r) => (
              <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-primary/15 transition-all hover:bg-primary/25" style={{ height: `${(r.v / max) * 100}%` }}>
                    <div className="h-1 w-full rounded-t-md bg-primary" />
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{r.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Low stock</h3>
            <Link to="/admin/inventory" className="text-xs text-primary">View all</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className={`text-xs font-medium ${p.stock === 0 ? "text-destructive" : "text-warning-foreground/80"}`}>
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-xl border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b p-5">
          <div><h3 className="text-sm font-semibold">Recent orders</h3><p className="mt-0.5 text-xs text-muted-foreground">Latest activity across your store</p></div>
          <Button asChild variant="ghost" size="sm"><Link to="/admin/orders">View all <ArrowRight className="ml-1 size-3.5" /></Link></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold">{o.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{o.date}</td>
                  <td className="px-5 py-3.5"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5"><PaymentStatusBadge status={o.payment} /></td>
                  <td className="px-5 py-3.5 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
