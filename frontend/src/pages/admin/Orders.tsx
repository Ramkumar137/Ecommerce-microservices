import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { orders, type Order } from "@/lib/mock-data";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AdminOrders() {
  const [selected, setSelected] = useState<Order | null>(null);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const filtered = orders.filter((o) =>
    (status === "all" || o.status === status) &&
    (o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageHeader title="Orders" description={`${filtered.length} orders`} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order # or customer…" className="h-10 pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-soft">
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
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold">{o.id}</td>
                  <td className="px-5 py-3.5"><p className="font-medium">{o.customer}</p><p className="text-xs text-muted-foreground">{o.email}</p></td>
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

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="font-mono">{selected.id}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <OrderStatusBadge status={selected.status} />
                  <PaymentStatusBadge status={selected.payment} />
                </div>
                <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-surface p-4 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Customer</dt><dd className="mt-0.5 font-medium">{selected.customer}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-0.5 truncate font-medium">{selected.email}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Date</dt><dd className="mt-0.5 font-medium">{selected.date}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Items</dt><dd className="mt-0.5 font-medium">{selected.items}</dd></div>
                </dl>
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(selected.total * 0.92)}</span></div>
                  <div className="mt-1.5 flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
                  <div className="mt-1.5 flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatPrice(selected.total * 0.08)}</span></div>
                  <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
                </div>
                <div className="flex gap-2"><Button className="flex-1">Update status</Button><Button variant="outline">Print invoice</Button></div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AdminOrders;
