import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { paymentsApi } from "@/api/payments";
import { ordersApi } from "@/api/orders";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { StatCard } from "@/components/common/StatCard";
import {
  CircleDollarSign,
  ReceiptText,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storage } from "@/utils/storage";
import { isJwtExpired } from "@/utils/session";
import type { Payment, PaymentStatus } from "@/types/payment";

const PAGE_SIZE = 10;

function AdminPayments() {
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal state
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
      toast.error("Session expired. Please sign in as Admin.");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const [payRes, ordRes] = await Promise.allSettled([
        paymentsApi.listAdmin(),
        ordersApi.listAdmin(),
      ]);

      const payData = payRes.status === "fulfilled" && Array.isArray(payRes.value) ? payRes.value : [];
      const ordData = ordRes.status === "fulfilled" && Array.isArray(ordRes.value) ? ordRes.value : [];

      setPaymentsList(payData);
      setOrdersList(ordData);
      setCurrentPage(1);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        toast.error("Admin permission required. Redirecting...");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } else {
        setErrorMsg("Unable to retrieve payment records. Please verify your connection or try again.");
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
      await paymentsApi.updateStatus(selectedPayment.payment_id, {
        status: newStatus,
        transaction_id: selectedPayment.transaction_id || `TXN-${Date.now()}`,
      });

      toast.success(`Payment status updated to ${newStatus}`);
      setEditOpen(false);
      await loadPayments();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        toast.error("Admin permission required to perform this action.");
      } else {
        toast.error("Failed to update payment status. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  }

  // Filter logic
  const filteredPayments = useMemo(() => {
    return paymentsList.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.payment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(searchQuery.toLowerCase()));

      const upperStatus = String(p.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        upperStatus === statusFilter ||
        (statusFilter === "SUCCESS" && (upperStatus === "SUCCESS" || upperStatus === "COMPLETED" || upperStatus === "PAID")) ||
        (statusFilter === "FAILED" && (upperStatus === "FAILED" || upperStatus === "CANCELLED")) ||
        (statusFilter === "PENDING" && (upperStatus === "PENDING" || upperStatus === "PROCESSING"));

      return matchesSearch && matchesStatus;
    });
  }, [paymentsList, searchQuery, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, currentPage]);

  const collected = useMemo(() => {
    const successfulPaymentOrderIds = new Set<string>();
    let paymentRev = 0;

    for (const p of paymentsList) {
      const st = String(p.status || "").toUpperCase();
      if (st !== "FAILED" && st !== "CANCELLED" && st !== "DECLINED" && st !== "REJECTED") {
        paymentRev += Number(p.amount || (p as any).total_amount || (p as any).total || 0);
        if (p.order_id) {
          successfulPaymentOrderIds.add(String(p.order_id));
        }
      }
    }

    let additionalOrderRev = 0;
    for (const o of ordersList) {
      const st = String(o.status || "").toUpperCase();
      if (st !== "CANCELLED" && st !== "FAILED" && st !== "REJECTED" && !successfulPaymentOrderIds.has(String(o.order_id))) {
        additionalOrderRev += Number(o.total_amount || (o as any).amount || 0);
      }
    }

    return paymentRev + additionalOrderRev;
  }, [paymentsList, ordersList]);

  const pendingCount = useMemo(() => {
    return paymentsList.filter((p) => {
      const s = String(p.status || "").toUpperCase();
      return s === "PENDING" || s === "PROCESSING";
    }).length;
  }, [paymentsList]);

  const failedCount = useMemo(() => {
    return paymentsList.filter((p) => {
      const s = String(p.status || "").toUpperCase();
      return s === "FAILED" || s === "CANCELLED";
    }).length;
  }, [paymentsList]);

  return (
    <>
      <PageHeader title="Payments" description="Track collected revenue and manage transaction status." />

      {/* Summary Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected Revenue" value={formatPrice(collected)} delta={9.1} icon={CircleDollarSign} />
        <StatCard label="Total Transactions" value={paymentsList.length.toString()} delta={5.2} icon={ReceiptText} />
        <StatCard label="Pending / Processing" value={pendingCount.toString()} icon={Clock} />
        <StatCard label="Failed / Cancelled" value={failedCount.toString()} icon={XCircle} />
      </div>

      {/* Status Edit Modal */}
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
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Select New Status</p>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as PaymentStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
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

      {/* Main Table Section */}
      <div className="mt-6 rounded-xl border bg-card shadow-soft overflow-hidden">
        {/* Controls Header */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between bg-surface/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Payment or Order ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
                <SelectItem value="REFUNDED">REFUNDED</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={loadPayments}
              disabled={loading}
              className="h-9 px-3 gap-1.5 text-xs"
              title="Refresh payments list"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-sm text-muted-foreground gap-3">
            <Loader2 className="size-7 animate-spin text-primary" />
            <span className="font-medium">Loading payment records...</span>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-sm gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <p className="max-w-md font-medium text-foreground">{errorMsg}</p>
            <Button variant="default" size="sm" onClick={loadPayments} className="mt-2 gap-2">
              <RefreshCw className="size-4" /> Retry
            </Button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "ALL"
              ? "No payment records match your search filters."
              : "No payment records available yet."}
          </div>
        ) : (
          <>
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 border-b bg-surface text-xs uppercase tracking-wider text-muted-foreground shadow-xs">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Payment ID</th>
                    <th className="px-5 py-3.5 font-semibold">Order ID</th>
                    <th className="px-5 py-3.5 font-semibold">Amount (₹)</th>
                    <th className="px-5 py-3.5 font-semibold">Payment Method</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Date</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {paginatedPayments.map((p) => (
                    <tr
                      key={p.payment_id}
                      className="group transition-colors duration-150 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {p.payment_id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {p.order_id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {formatPrice(Number(p.amount))}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium uppercase text-muted-foreground">
                        {p.payment_method || "N/A"}
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentStatusBadge status={p.status as any} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(p)}
                          className="h-8 text-xs font-medium"
                        >
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-surface/30 text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <strong className="text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground">
                  {Math.min(currentPage * PAGE_SIZE, filteredPayments.length)}
                </strong>{" "}
                of <strong className="text-foreground">{filteredPayments.length}</strong> payments
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 p-0"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>

                  <span className="px-2 font-medium text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 p-0"
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AdminPayments;
