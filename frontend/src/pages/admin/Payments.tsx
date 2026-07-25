import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { paymentsApi } from "@/api/payments";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { StatCard } from "@/components/common/StatCard";
import { CircleDollarSign, ReceiptText, RotateCcw, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storage } from "@/utils/storage";
import { isJwtExpired } from "@/utils/session";
import type { Payment, PaymentStatus } from "@/types/payment";

function AdminPayments() {
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PaymentStatus>("PENDING");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
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
      const data = await paymentsApi.listAdmin();
      setPaymentsList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        toast.error("Admin access required");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } else {
        const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.response?.data?.message || "Failed to load payments data";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(p: Payment) {
    setSelectedPayment(p);
    setNewStatus(p.status);
    setEditOpen(true);
  }

  async function handleUpdateStatus() {
    if (!selectedPayment) return;
    try {
      setUpdating(true);
      const targetStatus = newStatus === ("COMPLETED" as any) ? "SUCCESS" : newStatus;
      await paymentsApi.updateStatus(selectedPayment.payment_id, {
        status: targetStatus,
        transaction_id: selectedPayment.transaction_id || `TXN-${Date.now()}`,
      });
      toast.success(`Payment status updated to ${targetStatus}`);
      setEditOpen(false);
      await loadPayments();
    } catch (err: any) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const apiMsg =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string" ? responseData : null);

      if (status === 403) {
        toast.error("Admin access required");
      } else if (status === 400) {
        toast.error(apiMsg || "Invalid payment status provided");
      } else {
        toast.error(apiMsg || "Failed to update payment status");
      }
    } finally {
      setUpdating(false);
    }
  }

  const collected = paymentsList
    .filter((p) => p.status === "COMPLETED" || p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const refunded = paymentsList.filter((p) => p.status === "REFUNDED").length;
  const failed = paymentsList.filter((p) => p.status === "FAILED").length;

  return (
    <>
      <PageHeader title="Payments" description="Track collected revenue and manage transaction status." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected" value={formatPrice(collected)} delta={9.1} icon={CircleDollarSign} />
        <StatCard label="Transactions" value={paymentsList.length.toString()} delta={5.2} icon={ReceiptText} />
        <StatCard label="Refunded" value={refunded.toString()} icon={RotateCcw} />
        <StatCard label="Failed" value={failed.toString()} icon={XCircle} />
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-surface p-3 text-xs space-y-1">
                <p><strong className="text-foreground">Payment ID:</strong> <span className="font-mono">{selectedPayment.payment_id}</span></p>
                <p><strong className="text-foreground">Order ID:</strong> <span className="font-mono">{selectedPayment.order_id}</span></p>
                <p><strong className="text-foreground">Amount:</strong> {formatPrice(Number(selectedPayment.amount))}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Select Status</p>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as PaymentStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                    <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Saving..." : "Save Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Loading payment records...</span>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-sm gap-3">
              <p className="text-destructive font-medium">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={loadPayments} className="gap-2">
                <RefreshCw className="size-4" /> Try Again
              </Button>
            </div>
          ) : paymentsList.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No payment records found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Payment ID</th>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paymentsList.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold">{p.payment_id}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.order_id}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium">{p.payment_method}</td>
                    <td className="px-5 py-3.5">
                      <PaymentStatusBadge status={p.status as any} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatPrice(Number(p.amount))}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>
                        Update Status
                      </Button>
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

export default AdminPayments;
