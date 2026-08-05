import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ordersApi } from "@/api/orders";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice, useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Copy,
  Check,
  ShoppingBag,
  FileText,
  Truck,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackOrderModal } from "@/components/common/TrackOrderModal";
import { toast } from "sonner";
import type { Order } from "@/types/order";

type FilterStatus = "ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED";

export function getOrderContactInfo(o: Order, fallbackUser?: any) {
  const c = (o as any).contact || (o as any).contact_info || (o as any).customer || {};
  const s = (o as any).shipping || (o as any).shipping_address || (o as any).shippingAddress || (o as any).delivery || {};

  let street = "";
  let city = "";
  let state = "";
  let pincode = "";
  let country = "";

  if (typeof s === "string" && s.trim()) {
    street = s;
  } else {
    street = s.address_line1 || s.address || s.street || c.address_line1 || c.address || c.street || (o as any).address || "";
    city = s.city || c.city || (o as any).city || "";
    state = s.state || c.state || (o as any).state || "";
    pincode = s.pincode || s.zip || s.postal_code || s.zipcode || c.pincode || c.zip || (o as any).zip || (o as any).pincode || "";
    country = s.country || c.country || (o as any).country || "";
  }

  // Fallback to permanently saved address in localStorage if order data has no street address or only country
  if ((!street || street.trim().toLowerCase() === "india") && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("heisenflow_default_address");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.address) street = parsed.address;
        if (parsed.city && (!city || city.toLowerCase() === "india")) city = parsed.city;
        if (parsed.state && (!state || state.toLowerCase() === "india")) state = parsed.state;
        if (parsed.zip && (!pincode || pincode.toLowerCase() === "india")) pincode = parsed.zip;
        if (parsed.country) country = parsed.country;
      }
    } catch (e) {
      console.error("Failed to parse saved default address", e);
    }
  }

  const firstName = c.first_name || c.firstName || s.first_name || s.firstName || (o as any).first_name || fallbackUser?.first_name || "";
  const lastName = c.last_name || c.lastName || s.last_name || s.lastName || (o as any).last_name || fallbackUser?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Customer Account";

  const email = c.email || s.email || (o as any).email || fallbackUser?.email || "";
  const phone = c.phone || s.phone || c.phone_number || s.phone_number || (o as any).phone || fallbackUser?.phone || "Not provided";

  // Filter & deduplicate address elements
  const rawParts = [street, city, state, pincode, country].filter((p) => p && String(p).trim().length > 0);
  const uniqueParts: string[] = [];
  for (const part of rawParts) {
    const trimmed = String(part).trim();
    if (!uniqueParts.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      uniqueParts.push(trimmed);
    }
  }

  const fullAddress = uniqueParts.length > 0 ? uniqueParts.join(", ") : "Standard Delivery Address";

  return {
    fullName,
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    state,
    pincode,
    country: country || "India",
    fullAddress,
  };
}

export function generateInvoicePDF(order: Order, fallbackUser?: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to download invoice.");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const contact = getOrderContactInfo(order, fallbackUser);
  const orderDate = new Date(order.created_at || (order as any).placed_at || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${order.order_id} - HeisenFlow</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; margin: 0; padding: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #000; letter-spacing: -0.5px; }
          .logo span { color: #2563eb; }
          .inv-title { font-size: 20px; font-weight: 700; color: #374151; text-align: right; }
          .inv-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 40px; }
          .col { flex: 1; }
          .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280; margin-bottom: 6px; letter-spacing: 0.5px; }
          .val { font-size: 13px; color: #1f2937; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f9fafb; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151; text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
          td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937; }
          .right { text-align: right; }
          .totals { width: 300px; margin-left: auto; border-top: 2px solid #e5e7eb; padding-top: 10px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .total-row { font-size: 16px; font-weight: 800; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 6px; }
          .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 11px; color: #9ca3af; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Heisen<span>Flow</span> E-Commerce</div>
            <div style="font-size:12px; color:#6b7280; margin-top:4px;">Multi-Microservice Storefront</div>
          </div>
          <div>
            <div class="inv-title">TAX INVOICE</div>
            <div class="inv-details">Invoice #: INV-${order.order_id}</div>
            <div class="inv-details">Date: ${orderDate}</div>
          </div>
        </div>

        <div class="grid">
          <div class="col">
            <div class="label">Billed To (Customer Checkout):</div>
            <div class="val"><strong>${contact.fullName}</strong></div>
            <div class="val">${contact.fullAddress}</div>
            <div class="val">Phone: ${contact.phone}</div>
            ${contact.email ? `<div class="val">Email: ${contact.email}</div>` : ""}
          </div>
          <div class="col" style="text-align:right;">
            <div class="label">Order Information:</div>
            <div class="val">Order ID: <strong>${order.order_id}</strong></div>
            <div class="val">Payment Status: <strong style="color:#059669;">PAID / COMPLETED</strong></div>
            <div class="val">Fulfillment: <strong>${String(order.status || "CONFIRMED").toUpperCase()}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="right">Unit Price</th>
              <th class="right">Qty</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((it: any) => {
                const pricing = getItemPricing(it);
                return `
                <tr>
                  <td><strong>${it.product_name || `Product #${it.product_id}`}</strong></td>
                  <td class="right">${pricing.formattedUnitPrice}</td>
                  <td class="right">${pricing.quantity}</td>
                  <td class="right"><strong>${pricing.formattedItemTotal}</strong></td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="row">
            <span>Subtotal</span>
            <span>${formatPrice(Number(order.total_amount || 0))}</span>
          </div>
          <div class="row">
            <span>Shipping & Handling</span>
            <span style="color:#059669;">FREE</span>
          </div>
          <div class="row total-row">
            <span>Total Amount Paid</span>
            <span>${formatPrice(Number(order.total_amount || 0))}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for shopping with HeisenFlow! For support, contact support@heisenflow.com
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

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

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { InvoicePreviewModal } from "@/components/common/InvoicePreviewModal";

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
  const { user } = useAuth();
  const { add } = useCart();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reordering, setReordering] = useState(false);

  const handleCopyOrderId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(o.order_id);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReorder = async () => {
    if (!Array.isArray(o.items) || o.items.length === 0) return;
    try {
      setReordering(true);
      for (const it of o.items) {
        await add({
          product_id: String(it.product_id || (it as any).productId || ""),
          name: it.product_name || `Product #${it.product_id}`,
          price: getItemPricing(it).unitPrice,
          stock: 99,
          image_url: it.image_url || "",
          category: "General",
          is_active: true,
          description: "",
          brand: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }
      toast.success(`Reordered ${o.items.length} items to cart!`);
    } catch {
      toast.error("Failed to add products to cart.");
    } finally {
      setReordering(false);
    }
  };

  const contact = getOrderContactInfo(o, user);

  return (
    <div
      className={`rounded-xl border bg-card shadow-soft transition-all duration-200 hover:shadow-elevated overflow-hidden ${
        isLatest ? "ring-2 ring-primary/40 border-primary/50" : ""
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b bg-surface/50">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="uppercase tracking-wider text-muted-foreground font-semibold">Order ID</p>
              {isLatest && (
                <span className="rounded-full bg-primary px-2 py-0.2 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                  NEWEST
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="font-mono font-bold text-foreground text-sm">{o.order_id}</p>
              <button
                onClick={handleCopyOrderId}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded-xs"
                title="Copy Order ID"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <p className="uppercase tracking-wider text-muted-foreground font-semibold">Placed On</p>
            <p className="mt-0.5 font-medium text-foreground">{orderDate}</p>
          </div>

          <div>
            <p className="uppercase tracking-wider text-muted-foreground font-semibold">Total Amount</p>
            <p className="mt-0.5 font-bold text-primary text-sm">{formatPrice(Number(o.total_amount || 0))}</p>
          </div>
        </div>

        {/* Action Controls: Track Status & Order Details */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrackingModal(true)}
            className="h-8 text-xs gap-1.5 font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
          >
            <MapPin className="size-3.5" />
            Track Status
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailsModal(true)}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            <FileText className="size-3.5 text-muted-foreground" />
            Order Details
          </Button>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 space-y-4">
        {(contact.fullName || contact.fullAddress) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-surface/30 text-xs">
            <div className="flex items-start gap-2.5">
              <Truck className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">{contact.fullName}</span>
                {contact.fullAddress && <p className="text-muted-foreground mt-0.5">{contact.fullAddress}</p>}
              </div>
            </div>
            {contact.phone && (
              <span className="font-mono text-muted-foreground shrink-0">{contact.phone}</span>
            )}
          </div>
        )}

        {/* Product Items — Header row with Order Status badge at right end */}
        {Array.isArray(o.items) && o.items.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Items</h5>
              <OrderStatusBadge status={o.status as any} />
            </div>
            <div className="divide-y rounded-xl border bg-card">
              {o.items.map((it: any, i: number) => {
                const pricing = getItemPricing(it);
                return (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {it.image_url ? (
                        <img src={it.image_url} alt={it.product_name || ""} className="size-10 rounded-lg border object-cover shrink-0" />
                      ) : (
                        <div className="grid size-10 place-items-center rounded-lg bg-muted/60 text-muted-foreground shrink-0">
                          <Package className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-foreground truncate">{it.product_name || `Product #${it.product_id}`}</p>
                        <p className="text-muted-foreground font-mono">{pricing.formattedUnitPrice} × {pricing.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="font-bold text-foreground text-sm">{pricing.formattedItemTotal}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 font-medium"
                      >
                        <Link to="/products/$id" params={{ id: String(it.product_id || it.productId || "") }}>
                          View Item
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReorder}
            disabled={reordering}
            className="gap-1.5 text-xs font-semibold"
          >
            {reordering ? <Loader2 className="size-3.5 animate-spin" /> : <ShoppingBag className="size-3.5" />}
            Buy Order Again
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowInvoiceModal(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="size-3.5" /> Download Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Preview & Print/Download Modal */}
      <InvoicePreviewModal
        order={o}
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        user={user}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        order={o}
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
        onCancelOrder={onCancelOrder}
      />

      {/* Order Details Popup Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg overflow-hidden sm:rounded-2xl p-6 border bg-card shadow-2xl space-y-4">
          <DialogHeader className="text-left pb-3 border-b space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-semibold">#{o.order_id}</span>
              <OrderStatusBadge status={o.status as any} />
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Order Details & Customer Profile
            </DialogTitle>
          </DialogHeader>

          {/* Customer & Delivery Information */}
          <div className="rounded-xl border bg-surface/50 p-4 space-y-3 text-xs">
            <h5 className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
              Customer & Delivery Details
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Customer Name</span>
                <p className="font-semibold text-foreground mt-0.5">{contact.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone Number</span>
                <p className="font-mono font-medium text-foreground mt-0.5">{contact.phone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Delivery Address</span>
                <p className="font-medium text-foreground mt-0.5 leading-relaxed">{contact.fullAddress}</p>
              </div>
              {contact.email && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Email Address</span>
                  <p className="font-medium text-foreground mt-0.5">{contact.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchased Products */}
          <div className="space-y-2 text-xs">
            <h5 className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">Purchased Products</h5>
            <div className="divide-y rounded-xl border max-h-48 overflow-y-auto">
              {Array.isArray(o.items) && o.items.map((it: any, idx: number) => {
                const pricing = getItemPricing(it);
                return (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {it.image_url && <img src={it.image_url} alt="" className="size-8 rounded-md border object-cover shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{it.product_name || `Product #${it.product_id}`}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{pricing.formattedUnitPrice} × {pricing.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground shrink-0 ml-2">{pricing.formattedItemTotal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-3 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Total Paid</span>
            <span className="text-base font-bold text-primary">{formatPrice(Number(o.total_amount || 0))}</span>
          </div>
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

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

  // Unauthenticated View
  if (!isAuthenticated) {
    return (
      <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <PageHeader
          title="Your Orders"
          description="Authentication required to view order history"
        />
        <div className="mt-8">
          <EmptyState
            icon={Lock}
            title="Sign in to view your orders"
            description="Please log in or create an account to view your order history, track shipments, and manage past purchases."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2 font-semibold">
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

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    let list = [...userOrders];

    // Status filtering
    if (statusFilter === "ACTIVE") {
      list = list.filter((o) => {
        const s = String(o.status || "").toUpperCase();
        return s === "PENDING" || s === "PLACED" || s === "CONFIRMED" || s === "PROCESSING" || s === "SHIPPED";
      });
    } else if (statusFilter === "DELIVERED") {
      list = list.filter((o) => {
        const s = String(o.status || "").toUpperCase();
        return s === "DELIVERED" || s === "COMPLETED";
      });
    } else if (statusFilter === "CANCELLED") {
      list = list.filter((o) => {
        const s = String(o.status || "").toUpperCase();
        return s === "CANCELLED" || s === "FAILED" || s === "REJECTED";
      });
    }

    // Search filtering (Order ID or Product Title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const idMatch = String(o.order_id || "").toLowerCase().includes(q);
        const itemMatch = Array.isArray(o.items) && o.items.some((it: any) =>
          String(it.product_name || "").toLowerCase().includes(q)
        );
        return idMatch || itemMatch;
      });
    }

    // Sort newest first
    return list.sort((a, b) => {
      const rawA = a.created_at || (a as any).placed_at || (a as any).date;
      const rawB = b.created_at || (b as any).placed_at || (b as any).date;
      const timeA = rawA ? new Date(rawA).getTime() : 0;
      const timeB = rawB ? new Date(rawB).getTime() : 0;
      return timeB - timeA;
    });
  }, [userOrders, statusFilter, searchQuery]);

  // Overall Statistics Metrics
  const metrics = useMemo(() => {
    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const activeCount = userOrders.filter((o) => {
      const s = String(o.status || "").toUpperCase();
      return s === "PENDING" || s === "PLACED" || s === "CONFIRMED" || s === "PROCESSING" || s === "SHIPPED";
    }).length;
    const completedCount = userOrders.filter((o) => {
      const s = String(o.status || "").toUpperCase();
      return s === "DELIVERED" || s === "COMPLETED";
    }).length;

    return {
      totalOrders: userOrders.length,
      totalSpent,
      activeCount,
      completedCount,
    };
  }, [userOrders]);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 space-y-6">
      <PageHeader
        title="My Orders"
        description="Track, review, or reorder your past purchases."
      />

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-soft space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <Package className="size-4 text-primary" /> Total Orders
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.totalOrders}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-soft space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <Clock className="size-4 text-amber-500" /> Active Deliveries
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.activeCount}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-soft space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <Check className="size-4 text-emerald-500" /> Completed
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.completedCount}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-soft space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <DollarSign className="size-4 text-blue-500" /> Total Spent
          </div>
          <p className="text-2xl font-bold text-primary">{formatPrice(metrics.totalSpent)}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ACTIVE", label: `Active (${metrics.activeCount})` },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.id as FilterStatus)}
              className="h-8 text-xs font-medium shrink-0"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Order ID or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Main Order Content */}
      {loading ? (
        <div className="space-y-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="pt-4">
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
      ) : filteredOrders.length === 0 ? (
        <div className="pt-4">
          <EmptyState
            icon={Package}
            title={searchQuery || statusFilter !== "ALL" ? "No matching orders found" : "No orders yet"}
            description={
              searchQuery || statusFilter !== "ALL"
                ? "Try clearing your search query or selecting a different status filter."
                : "When you place an order, it will appear here with live tracking updates."
            }
            action={
              searchQuery || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild font-semibold>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o, idx) => {
            const isLatest = idx === 0 && statusFilter === "ALL" && !searchQuery;
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
