import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/context/cart-context";
import { getOrderContactInfo, getItemPricing } from "@/pages/customer/Orders";
import { Download, Printer, FileText, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import type { Order } from "@/types/order";

export function InvoicePreviewModal({
  order,
  open,
  onOpenChange,
  user,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
}) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const contact = getOrderContactInfo(order, user);
  const orderDate = new Date(order.created_at || (order as any).placed_at || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handlePrintDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-6 border bg-card shadow-2xl space-y-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b space-y-0">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <FileText className="size-4" /> Invoice Preview
            </span>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              Invoice #{order.order_id}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrintDownload} className="gap-1.5 font-semibold text-xs">
              <Download className="size-3.5" /> Download / Print PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Tax Invoice Paper Box */}
        <div className="rounded-xl border bg-white p-6 text-gray-900 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                Heisen<span className="text-blue-600">Flow</span> E-Commerce
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Multi-Microservice Storefront</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-bold uppercase text-gray-700 tracking-wider">TAX INVOICE</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">INV-{order.order_id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{orderDate}</p>
            </div>
          </div>

          {/* Contact & Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Billed To (Customer Checkout)</p>
              <p className="font-semibold text-gray-900 text-sm">{contact.fullName}</p>
              <p className="text-gray-600 leading-relaxed">{contact.fullAddress}</p>
              <p className="text-gray-600">Phone: {contact.phone}</p>
              {contact.email && <p className="text-gray-600">Email: {contact.email}</p>}
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Order & Payment Details</p>
              <p className="text-gray-700">Order ID: <span className="font-mono font-bold text-gray-900">{order.order_id}</span></p>
              <p className="text-emerald-600 font-bold">Payment Status: PAID / COMPLETED</p>
              <p className="text-gray-700">Status: <span className="font-semibold">{String(order.status || "CONFIRMED").toUpperCase()}</span></p>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it: any, idx: number) => {
                  const pricing = getItemPricing(it);
                  return (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-gray-900">{it.product_name || `Product #${it.product_id}`}</td>
                      <td className="p-3 text-right text-gray-600">{pricing.formattedUnitPrice}</td>
                      <td className="p-3 text-right text-gray-600">{pricing.quantity}</td>
                      <td className="p-3 text-right font-bold text-gray-900">{pricing.formattedItemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="w-full sm:w-64 ml-auto space-y-1.5 text-xs pt-2 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.total_amount || 0))}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Shipping & Handling</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>Total Amount Paid</span>
              <span>{formatPrice(Number(order.total_amount || 0))}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={handlePrintDownload} className="gap-1.5 font-semibold text-xs">
            <Download className="size-3.5" /> Download / Print PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
