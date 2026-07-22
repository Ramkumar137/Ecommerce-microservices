import { Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderSuccess() {
  const orderId = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-7" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Thank you for your order</h1>
      <p className="mt-3 text-[15px] text-muted-foreground">
        We've received your order and are getting it ready. A confirmation email is on its way.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-6 text-left shadow-soft">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order number</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">{orderId}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            <span className="size-1.5 rounded-full bg-current" /> Confirmed
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-foreground" />
            <div><p className="text-sm font-medium">Confirmation sent</p><p className="text-xs text-muted-foreground">Check your inbox for details.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 size-4 text-foreground" />
            <div><p className="text-sm font-medium">Shipping soon</p><p className="text-xs text-muted-foreground">You'll get a tracking link.</p></div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild><Link to="/orders">View orders</Link></Button>
        <Button asChild variant="outline"><Link to="/products">Continue shopping</Link></Button>
      </div>
    </div>
  );
}

export default OrderSuccess;
