import { PageHeader } from "@/components/common/PageHeader";
import { payments } from "@/lib/mock-data";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { StatCard } from "@/components/common/StatCard";
import { CircleDollarSign, ReceiptText, RotateCcw, XCircle } from "lucide-react";

function AdminPayments() {
  const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter((p) => p.status === "refunded").length;

  return (
    <>
      <PageHeader title="Payments" description="Track collected revenue and refunds." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected" value={formatPrice(paid)} delta={9.1} icon={CircleDollarSign} />
        <StatCard label="Transactions" value={payments.length.toString()} delta={5.2} icon={ReceiptText} />
        <StatCard label="Refunded" value={refunded.toString()} icon={RotateCcw} />
        <StatCard label="Failed" value="0" icon={XCircle} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold">{p.id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.orderId}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3.5">{p.method}</td>
                  <td className="px-5 py-3.5"><PaymentStatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-right font-semibold">{formatPrice(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminPayments;
