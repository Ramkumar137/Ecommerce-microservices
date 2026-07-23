import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DollarSign, ShoppingBag, Package, ArrowRight, Layers } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import type { Product } from "@/types/product";
import type { InventoryItem } from "@/types/inventory";
import type { Order } from "@/types/order";
import type { Payment } from "@/types/payment";

function AdminDashboard() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [paymentList, setPaymentList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, invs, ords, pymts] = await Promise.all([
          productsApi.list().catch(() => []),
          inventoryApi.list().catch(() => []),
          ordersApi.list().catch(() => []),
          paymentsApi.list().catch(() => []),
        ]);

        setProductList(Array.isArray(prods) ? prods : []);
        setInventoryList(Array.isArray(invs) ? invs : []);
        setOrderList(Array.isArray(ords) ? ords : []);
        setPaymentList(Array.isArray(pymts) ? pymts : []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = paymentList
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const lowStock = productList.filter((p) => Number(p.stock) < 10).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your ecommerce microservices performance."
        actions={
          <Button asChild>
            <Link to="/admin/products">Manage Products</Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          delta={12.4}
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={orderList.length.toString()}
          delta={8.2}
          icon={ShoppingBag}
        />
        <StatCard
          label="Active Products"
          value={productList.length.toString()}
          delta={4.6}
          icon={Package}
        />
        <StatCard
          label="Inventory Tracked"
          value={inventoryList.length.toString()}
          delta={2.1}
          icon={Layers}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity summary */}
        <div className="rounded-xl border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold">Microservices Health & Overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Connected backend APIs</p>
            </div>
            <span className="text-xs font-semibold text-success">Active Services</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Auth Service</p>
              <p className="text-muted-foreground">Cognito JWT Authentication</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Product Service</p>
              <p className="text-muted-foreground">{productList.length} products loaded</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Inventory Service</p>
              <p className="text-muted-foreground">{inventoryList.length} items tracked</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Order & Payment Services</p>
              <p className="text-muted-foreground">{orderList.length} orders / {paymentList.length} payments</p>
            </div>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Low stock items</h3>
            <Link to="/admin/inventory" className="text-xs text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No low stock warnings.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((p) => (
                <li key={p.product_id} className="flex items-center gap-3">
                  <img
                    src={
                      p.image_url ||
                      `https://placehold.co/100x100?text=${encodeURIComponent(p.name)}`
                    }
                    alt=""
                    className="size-10 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      Number(p.stock) === 0 ? "text-destructive" : "text-warning"
                    }`}
                  >
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-xl border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-sm font-semibold">Recent orders</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest order service activity</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/orders">
              View all <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading dashboard data...</div>
          ) : orderList.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No orders recorded yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer ID</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orderList.slice(0, 5).map((o) => (
                  <tr key={o.order_id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold">{o.order_id}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{o.user_id}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Recent"}
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
      </div>
    </>
  );
}

export default AdminDashboard;
