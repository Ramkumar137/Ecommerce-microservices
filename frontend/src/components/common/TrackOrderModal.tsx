import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { formatPrice } from "@/context/cart-context";
import { formatFriendlyDate } from "@/pages/customer/Orders";
import { CheckCircle2, Clock, Truck, PackageCheck, XCircle, MapPin } from "lucide-react";
import type { Order } from "@/types/order";

const VERTICAL_TRACKING_STEPS = [
  { key: "CONFIRMED", label: "Order Confirmed", desc: "Your order has been received & verified.", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", desc: "Items are being packed and prepared for shipment.", icon: Clock },
  { key: "SHIPPED", label: "Shipped", desc: "Package handed to logistics partner. On the way!", icon: Truck },
  { key: "DELIVERED", label: "Delivered", desc: "Package delivered to destination address.", icon: PackageCheck },
];

function getActiveStepIndex(statusStr: string): number {
  const upper = String(statusStr || "").toUpperCase().trim();
  if (upper === "DELIVERED" || upper === "SUCCESS" || upper === "COMPLETED") return 3;
  if (upper === "SHIPPED") return 2;
  if (upper === "PROCESSING") return 1;
  return 0; // PENDING, CONFIRMED, PLACED
}

export function TrackOrderModal({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  const statusUpper = String(order.status || "").toUpperCase().trim();
  const isCancelled = statusUpper === "CANCELLED" || statusUpper === "REJECTED";
  const activeStep = getActiveStepIndex(statusUpper);
  const formattedDate = formatFriendlyDate(order.created_at || (order as any).placed_at || (order as any).date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden sm:rounded-2xl p-6 border bg-card shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <MapPin className="size-4" /> Live Tracking
            </span>
            <OrderStatusBadge status={order.status as any} />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Order Tracking
          </DialogTitle>
        </DialogHeader>

        {/* Order Info Card */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border bg-surface p-3.5 text-xs my-2">
          <div>
            <p className="text-muted-foreground uppercase tracking-wider font-medium text-[10px]">Order ID</p>
            <p className="font-mono font-semibold text-foreground truncate mt-0.5">{order.order_id}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wider font-medium text-[10px]">Total Amount</p>
            <p className="font-semibold text-foreground mt-0.5">{formatPrice(Number(order.total_amount || 0))}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wider font-medium text-[10px]">Date Placed</p>
            <p className="font-medium text-foreground mt-0.5">{formattedDate}</p>
          </div>
        </div>

        {/* Vertical Stepper Timeline */}
        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive my-2">
            <XCircle className="size-5 shrink-0" />
            <div>
              <p className="font-semibold">Order Cancelled</p>
              <p className="mt-0.5 text-muted-foreground">This order has been cancelled and will not be delivered.</p>
            </div>
          </div>
        ) : (
          <div className="py-3 px-2">
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {VERTICAL_TRACKING_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <div key={step.key} className="relative flex items-start gap-4 group">
                    {/* Stepper Dot / Icon */}
                    <div
                      className={`absolute -left-6 top-0 grid size-6 place-items-center rounded-full border transition-all duration-300 ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                          : "border-border bg-card text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-emerald-500/20 scale-110" : ""}`}
                    >
                      <Icon className="size-3.5" />
                    </div>

                    {/* Step Content */}
                    <div className="pl-2">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
