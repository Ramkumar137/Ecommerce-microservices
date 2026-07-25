export function OrderStatusBadge({ status }: { status: string }) {
  const upper = String(status || "").toUpperCase().trim();
  let styleClass = "bg-muted text-muted-foreground border-muted/30";

  if (upper === "PENDING") {
    styleClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  } else if (upper === "SUCCESS" || upper === "DELIVERED" || upper === "COMPLETED" || upper === "PLACED") {
    styleClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  } else if (upper === "FAILED" || upper === "CANCELLED") {
    styleClass = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
  } else if (upper === "PROCESSING") {
    styleClass = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
  } else if (upper === "SHIPPED") {
    styleClass = "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${styleClass}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {upper || "UNKNOWN"}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const upper = String(status || "").toUpperCase().trim();
  let styleClass = "bg-muted text-muted-foreground border-muted/30";

  if (upper === "PENDING") {
    styleClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  } else if (upper === "SUCCESS" || upper === "COMPLETED" || upper === "PAID") {
    styleClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  } else if (upper === "FAILED" || upper === "CANCELLED") {
    styleClass = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
  } else if (upper === "REFUNDED") {
    styleClass = "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${styleClass}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {upper || "UNKNOWN"}
    </span>
  );
}
