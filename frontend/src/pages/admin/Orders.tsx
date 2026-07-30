import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ordersApi } from "@/api/orders";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { formatFriendlyDate } from "../customer/Orders";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { storage } from "@/utils/storage";
import { isJwtExpired } from "@/utils/session";
import type { Order, OrderStatus } from "@/types/order";

function AdminOrders() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const token = storage.getAccessToken();
    if (!token || isJwtExpired(token)) {
      toast.error("Admin access required");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await ordersApi.listAdmin();
      setOrdersList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        toast.error("Admin access required");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } else {
        const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.response?.data?.message || "Failed to load orders";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selected) return;
    try {
      setUpdating(true);
      const updatedOrder = await ordersApi.updateStatus(selected.order_id, {
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
      setSelected(updatedOrder);
      await loadOrders();
    } catch (err: any) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const apiMsg =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string" ? responseData : null);

      if (status === 403) {
        toast.error("Admin permission required");
      } else if (status === 400) {
        toast.error(apiMsg || "Invalid order status provided");
      } else {
        toast.error(apiMsg || "Failed to update order status");
      }
    } finally {
      setUpdating(false);
    }
  }

  const filtered = ordersList
    .filter((o) => {
      const matchesStatus =
        statusFilter === "all" || o.status?.toUpperCase() === statusFilter.toUpperCase();
      const matchesSearch =
        o.order_id.toLowerCase().includes(q.toLowerCase()) ||
        o.user_id.toLowerCase().includes(q.toLowerCase());

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
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
    <>
      <PageHeader title="Orders" description={`${filtered.length} total orders`} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order ID or user ID…"
            className="h-10 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
            <SelectItem value="SHIPPED">SHIPPED</SelectItem>
            <SelectItem value="DELIVERED">DELIVERED</SelectItem>
            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Loading customer orders...</span>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-sm gap-3">
              <p className="text-destructive font-medium">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">
                <RefreshCw className="size-4" /> Try Again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No customer orders found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">User ID</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((o) => (
                  <tr
                    key={o.order_id}
                    onClick={() => {
                      setSelected(o);
                      setNewStatus(o.status);
                    }}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold">{o.order_id}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{o.user_id}</td>
                    <td className="px-5 py-3.5 text-muted-foreground font-medium">
                      {formatFriendlyDate(o.created_at || (o as any).placed_at || (o as any).date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusBadge status={o.status as any} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatPrice(Number(o.total_amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !errorMsg && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t bg-surface/40 px-5 py-3 text-xs text-muted-foreground">
            <span>Showing <strong className="text-foreground">{filtered.length}</strong> of <strong className="text-foreground">{ordersList.length}</strong> orders</span>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.order_id}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <OrderStatusBadge status={selected.status as any} />
                </div>
                <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-surface p-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">User ID</dt>
                    <dd className="mt-0.5 font-medium truncate">{selected.user_id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Order Date</dt>
                    <dd className="mt-0.5 font-medium">
                      {selected.created_at
                        ? new Date(selected.created_at).toLocaleDateString()
                        : "Recent"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Items Count</dt>
                    <dd className="mt-0.5 font-medium">
                      {Array.isArray(selected.items) ? selected.items.length : 0} item(s)
                    </dd>
                  </div>
                </dl>

                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Update Order Status
                  </p>
                  <Select
                    value={newStatus}
                    onValueChange={(val) => setNewStatus(val as OrderStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                      <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                      <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} disabled={updating} className="w-full">
                    {updating ? "Updating..." : "Save Status"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AdminOrders;
