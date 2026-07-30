import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Landmark, Truck, Zap, Lock, Loader2, AlertCircle, ArrowRight, Check, QrCode, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, formatPrice } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { PaymentSuccessModal } from "@/components/common/PaymentSuccessModal";

function Section({
  step,
  activeStep,
  title,
  summaryText,
  onEdit,
  children,
}: {
  step: number;
  activeStep: number;
  title: string;
  summaryText?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const isCompleted = step < activeStep;
  const isActive = step === activeStep;

  return (
    <section className={`rounded-xl border bg-card p-6 transition-all ${isActive ? "ring-2 ring-primary/20 border-primary" : "opacity-85"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${
              isCompleted
                ? "bg-emerald-600 text-white"
                : isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isCompleted ? <Check className="size-3.5" /> : step}
          </span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {isCompleted && onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Edit
          </Button>
        )}
      </div>

      {isCompleted && summaryText && (
        <div className="mt-2 pl-9 text-xs text-muted-foreground font-medium">
          {summaryText}
        </div>
      )}

      {isActive && <div className="mt-5">{children}</div>}
    </section>
  );
}

function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [activeStep, setActiveStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "processing" | "success"
  >("processing");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState<{
    orderId?: string;
    amount?: number;
  } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-10">
        <PageHeader title="Checkout" description="Authentication required" />
        <div className="mt-8">
          <EmptyState
            icon={Lock}
            title="Sign in to checkout"
            description="Please sign in or create an account to complete your purchase and track your order."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
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
  
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    phone: user?.phone || "",
    address: "",
    city: "Chennai",
    zip: "",
    state: "TamilNadu",
    country: "India",
  });

  const navigate = useNavigate();

  const shippingCost = shippingMethod === "express" ? 1299 : subtotal > 4000 ? 0 : 599;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNextStep = (step: number) => {
    if (step === 1) {
      if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please fill out all contact information fields.");
        return;
      }
      setActiveStep(2);
    } else if (step === 2) {
      if (
        !formData.address.trim() ||
        !formData.city.trim() ||
        !formData.zip.trim() ||
        !formData.state.trim() ||
        !formData.country.trim()
      ) {
        toast.error("Please fill out all shipping address fields.");
        return;
      }
      setActiveStep(3);
    } else if (step === 3) {
      setActiveStep(4);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      setActiveStep(1);
      toast.error("Please complete contact information.");
      return;
    }

    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.zip.trim() ||
      !formData.state.trim() ||
      !formData.country.trim()
    ) {
      setActiveStep(2);
      toast.error("Please complete shipping address.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Convert Cart -> Order via Orders API
      setProcessingStep("Creating order...");
      const orderPayload = {
        contact: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          state: formData.state,
          country: formData.country,
        },
        delivery: {
          method: shippingMethod,
          cost: shippingCost,
        },
        items: items.map((i) => ({
          product_id: i.product.product_id,
          quantity: i.quantity,
          price: Number(i.product.price || 0),
        })),
        total_amount: total,
      };

      

      console.log("[1. Create Order Request]", orderPayload);
      let order: any;
      try {
        order = await ordersApi.create(orderPayload);
        console.log("[1. Create Order Response]", order);
      } catch (orderErr: any) {
        const responseData = orderErr?.response?.data;
        const apiMsg =
          responseData?.detail ||
          responseData?.message ||
          responseData?.error ||
          (typeof responseData === "string" ? responseData : orderErr.message) ||
          "Order creation service unavailable";
        console.error("[Order API Error]", orderErr?.response?.status, responseData);
        const exactError = `Order Creation Failed: ${apiMsg}`;
        setError(exactError);
        toast.error(exactError);
        return;
      }

      const createdOrderId = order?.order_id || order?.id || order?._id;
      if (!createdOrderId) {
        const exactError = "Order Creation Failed: Missing order_id in server response";
        console.error("[Order API Error]", exactError, order);
        setError(exactError);
        toast.error(exactError);
        return;
      }

      const localOrderStatus = "PLACED";

      // Step 2: Initiate Payment via Payments API
      setProcessingStep("Processing payment...");
      const paymentPayload = {
        order_id: createdOrderId,
        payment_method: paymentMethod,
        amount: total,
      };

      console.log("[2. Create Payment Request]", paymentPayload);
      let payment: any;
      try {
        payment = await paymentsApi.create(paymentPayload);
        console.log("[2. Create Payment Response]", payment);
      } catch (payErr: any) {
        const responseData = payErr?.response?.data;
        const apiMsg =
          responseData?.detail ||
          responseData?.message ||
          responseData?.error ||
          (typeof responseData === "string" ? responseData : payErr.message) ||
          "Payment initialization service unavailable";
        console.error("[Payment API Error]", payErr?.response?.status, responseData);

        const exactError = `Payment Initiation Failed: ${apiMsg}`;
        setError(exactError);
        toast.error(exactError);
        return;
      }

      const paymentId = payment?.payment_id || payment?.id;
      if (!paymentId && paymentMethod !== "COD") {
        const exactError = "Payment Initiation Failed: Missing payment_id in server response";
        console.error("[Payment API Error]", exactError, payment);
        setError(exactError);
        toast.error(exactError);
        return;
      }

      // Map Payment Status locally based on payment API response or COD method
      const rawPayStatus = String(payment?.status || "").toUpperCase();
      let localPaymentStatus = "SUCCESS";
      if (rawPayStatus === "PENDING" && paymentMethod !== "COD") {
        localPaymentStatus = "PENDING";
      } else if (rawPayStatus === "FAILED") {
        const exactError = "Payment Failed: Transaction rejected by payment provider";
        setError(exactError);
        toast.error(exactError);
        return;
      }

      // Step 3: Finalize Order & Trigger Celebration Modal
      setProcessingStep("Finalizing order...");
      await clear();
      console.log("Cart cleared after successful order & payment creation", {
        orderId: createdOrderId,
        orderStatus: localOrderStatus,
        paymentStatus: localPaymentStatus,
      });

      setSuccessOrderDetails({
        orderId: createdOrderId,
        amount: total,
      });
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error("[Unexpected Checkout Error]", err);
      const exactError =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : err?.message) ||
        "Unexpected error occurred during checkout";
      setError(exactError);
      toast.error(exactError);
    } finally {
      setLoading(false);
      setProcessingStep(null);
    }
  };

  const handlePayNow = async () => {
    setShowPaymentModal(true);
    setPaymentStatus("processing");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPaymentStatus("success");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setShowPaymentModal(false);
    setPaymentCompleted(true);
    setActiveStep(5);

    await handleSubmit();
  };

  const contactSummary = [
    `${formData.firstName} ${formData.lastName}`.trim(),
    formData.email, formData.phone,
  ]
    .filter(Boolean)
    .join(" · ");

  const shippingSummary = [
    formData.address,
    formData.city,
    formData.state,
    formData.zip,
  ]
    .filter(Boolean)
    .join(", ");

  const deliverySummary =
    shippingMethod === "express"
      ? "Express Shipping (1–2 business days · ₹1,299)"
      : `Standard Shipping (4–6 business days · ${subtotal > 4000 ? "Free" : "₹599"})`;

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
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
          <Section
            step={1}
            activeStep={activeStep}
            title="Contact information"
            summaryText={contactSummary}
            onEdit={() => setActiveStep(1)}
          >
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
                <Label htmlFor="firstName">Full Name</Label>
                <Input
                  id="firstName"
                  required
                  className="mt-1.5"
                  value={formData.firstName+ formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Mobile</Label>
                <Input
                  id="lastName"
                  required
                  className="mt-1.5"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sm:col-span-2 mt-2">
                <Button type="button" onClick={() => handleNextStep(1)} className="w-full sm:w-auto gap-2">
                  Continue to Shipping <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Section>

          <Section
            step={2}
            activeStep={activeStep}
            title="Shipping address"
            summaryText={shippingSummary}
            onEdit={() => setActiveStep(2)}
          >
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
              <div className="sm:col-span-2 mt-2 flex flex-wrap gap-3">
                <Button type="button" onClick={() => handleNextStep(2)} className="w-full sm:w-auto gap-2">
                  Continue to Delivery <ArrowRight className="size-4" />
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
                  Back
                </Button>
              </div>
            </div>
          </Section>

          <Section
            step={3}
            activeStep={activeStep}
            title="Delivery method"
            summaryText={deliverySummary}
            onEdit={() => setActiveStep(3)}
          >
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
                    4–6 business days · {subtotal > 4000 ? "Free" : "₹599"}
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
                  <p className="mt-1 text-xs text-muted-foreground">1–2 business days · ₹1,299</p>
                </div>
              </label>
            </RadioGroup>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={() => handleNextStep(3)} className="w-full sm:w-auto gap-2">
                Continue to Payment <ArrowRight className="size-4" />
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveStep(2)}>
                Back
              </Button>
            </div>
          </Section>

          <Section
            step={4}
            activeStep={activeStep}
            title="Payment"
            summaryText={
                paymentCompleted
                    ? `Paid via ${paymentMethod.replace("_", " ")}`
                    : undefined
            }
            onEdit={() => {
                setPaymentCompleted(false);
                setActiveStep(4);
            }}
        >
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "CARD" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="CARD" />
                <CreditCard className="size-4 text-primary" />
                <span className="text-sm font-medium">Credit/Debit Card</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "UPI" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="UPI" />
                <QrCode className="size-4 text-primary" />
                <span className="text-sm font-medium">UPI</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "BANK_TRANSFER" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="BANK_TRANSFER" />
                <Landmark className="size-4 text-primary" />
                <span className="text-sm font-medium">Netbanking</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "COD" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="COD" />
                <Banknote className="size-4 text-primary" />
                <span className="text-sm font-medium">Cash on Delivery</span>
              </label>
            </RadioGroup>

            {/* Conditional Input Views Based on Selected Method */}
            {paymentMethod === "CARD" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 rounded-lg border bg-muted/20 p-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="cn">Card number</Label>
                  <Input id="cn" placeholder="1234 5678 9012 3456" className="mt-1.5 bg-background" />
                </div>
                <div>
                  <Label htmlFor="exp2">Expiration</Label>
                  <Input id="exp2" placeholder="MM / YY" className="mt-1.5 bg-background" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVC</Label>
                  <Input id="cvv" placeholder="123" className="mt-1.5 bg-background" />
                </div>
              </div>
            )}

            {paymentMethod === "UPI" && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <Label htmlFor="upiId">VPA / UPI ID</Label>
                <Input id="upiId" placeholder="username@upi or mobile@paytm" className="mt-1.5 bg-background" />
                <p className="mt-2 text-xs text-muted-foreground">
                  A payment request will be sent to your UPI app (Google Pay, PhonePe, Paytm, etc.).
                </p>
              </div>
            )}

            {paymentMethod === "BANK_TRANSFER" && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <Label htmlFor="bankSelect">Select Bank</Label>
                <select
                  id="bankSelect"
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="SBI">Indian Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                  <option value="PNB">Indian Overseas Bank</option>
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  You will be redirected to your bank's portal to complete netbanking authentication.
                </p>
              </div>
            )}

            {paymentMethod === "COD" && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <Banknote className="size-4" />
                  <span className="text-sm font-semibold">Cash on Delivery</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pay with cash upon delivery. No additional online payment required.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={
                  paymentMethod === "COD"
                      ? handleSubmit
                      : handlePayNow
              }
          >
              {paymentMethod === "COD"
                  ? "Place Order"
                  : "Pay Now"}
              </Button>
            </div>
          </Section>

          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-80 rounded-2xl border bg-card p-8 text-center shadow-elevated">
                {paymentStatus === "processing" ? (
                  <>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Processing Payment</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">Please wait, do not close this window…</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="size-8 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Payment Successful!</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">Redirecting to your order…</p>
                  </>
                )}
              </div>
            </div>
          )}
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
          </div>
        </aside>
      </form>

      {/* Payment Success Celebration Modal */}
      <PaymentSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        orderId={successOrderDetails?.orderId}
        amount={successOrderDetails?.amount}
      />
    </div>
  );
}

export default Checkout;
