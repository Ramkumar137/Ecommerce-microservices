import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Landmark, Truck, Zap, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { toast } from "sonner";

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {step}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    address: "",
    city: "",
    zip: "",
    state: "",
    country: "United States",
  });

  const navigate = useNavigate();

  const shippingCost = shippingMethod === "express" ? 14.99 : subtotal > 50 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Convert Cart -> Order via Orders API
      setProcessingStep("Creating order...");
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.product_id,
          quantity: i.quantity,
        })),
      };

      const order = await ordersApi.create(orderPayload);
      if (!order || !order.order_id) {
        throw new Error("Failed to create order");
      }

      // Step 2: Initiate Payment via Payment API
      setProcessingStep("Initiating payment...");
      let payment;
      try {
        payment = await paymentsApi.create({
          order_id: order.order_id,
          payment_method: paymentMethod,
        });
      } catch (payErr: any) {
        const payErrMsg =
          payErr.response?.data?.message || payErr.message || "Payment initiation failed.";
        throw new Error(`Payment error: ${payErrMsg} (Order #${order.order_id} created)`);
      }

      // Step 3: Update Payment Status to COMPLETED
      setProcessingStep("Completing payment transaction...");
      if (payment && payment.payment_id) {
        try {
          await paymentsApi.updateStatus(payment.payment_id, {
            status: "COMPLETED",
            transaction_id: `TXN-${Date.now()}`,
          });
        } catch (statusErr: any) {
          throw new Error("Payment status verification failed.");
        }
      }

      // On Success: Clear cart & navigate to order success page
      setProcessingStep("Finalizing checkout...");
      toast.success("Order & Payment completed successfully!");
      await clear();

      navigate({
        to: "/order-success",
        search: { orderId: order.order_id },
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message || "Checkout failed.";
      setError(errorMessage);
      toast.error("Checkout process encountered an error");
    } finally {
      setLoading(false);
      setProcessingStep(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Checkout</h1>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">Checkout Failed</p>
            <p className="mt-0.5 text-xs text-destructive/90">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <Section step={1} title="Contact information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1.5"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  className="mt-1.5"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  required
                  className="mt-1.5"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Section>

          <Section step={2} title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  placeholder="123 Market St"
                  className="mt-1.5"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  className="mt-1.5"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="zip">Postal code</Label>
                <Input
                  id="zip"
                  required
                  className="mt-1.5"
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">State / Region</Label>
                <Input
                  id="state"
                  required
                  className="mt-1.5"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  required
                  className="mt-1.5"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Section>

          <Section step={3} title="Delivery method">
            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid gap-3 sm:grid-cols-2">
              <label
                htmlFor="std"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  shippingMethod === "standard" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="standard" id="std" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4" />
                    <span className="text-sm font-medium">Standard</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    4–6 business days · {subtotal > 50 ? "Free" : "$6.99"}
                  </p>
                </div>
              </label>
              <label
                htmlFor="exp"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  shippingMethod === "express" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="express" id="exp" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    <span className="text-sm font-medium">Express</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">1–2 business days · $14.99</p>
                </div>
              </label>
            </RadioGroup>
          </Section>

          <Section step={4} title="Payment">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                  paymentMethod === "CARD" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="CARD" />
                <CreditCard className="size-4" />
                <span className="text-sm font-medium">Credit card</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                  paymentMethod === "BANK_TRANSFER" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="BANK_TRANSFER" />
                <Landmark className="size-4" />
                <span className="text-sm font-medium">Bank transfer</span>
              </label>
            </RadioGroup>
            {paymentMethod === "CARD" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="cn">Card number</Label>
                  <Input id="cn" placeholder="1234 5678 9012 3456" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="exp2">Expiration</Label>
                  <Input id="exp2" placeholder="MM / YY" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVC</Label>
                  <Input id="cvv" placeholder="123" className="mt-1.5" />
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Order Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={it.product.product_id} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-surface">
                    <img
                      src={
                        it.product.image_url ||
                        `https://placehold.co/100x100?text=${encodeURIComponent(it.product.name)}`
                      }
                      alt=""
                      className="size-full object-cover"
                    />
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.product.brand || it.product.category}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(Number(it.product.price) * it.quantity)}
                  </span>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Your cart is empty.{" "}
                  <Link to="/products" className="text-primary">
                    Add items →
                  </Link>
                </li>
              )}
            </ul>
            <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>{formatPrice(tax)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={items.length === 0 || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  {processingStep || "Processing..."}
                </span>
              ) : (
                <>
                  <Lock className="mr-1.5 size-4" /> Place order
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Secure checkout · SSL encrypted
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;
