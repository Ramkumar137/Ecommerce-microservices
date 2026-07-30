import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/context/cart-context";
import { CheckCircle2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

interface PaymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  amount?: number;
}

// Celebration Confetti Radial Burst originating from center-top of modal
function runModalConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Origin point: center-top of centered modal
  const originX = canvas.width / 2;
  const originY = Math.max(100, canvas.height / 2 - 140);

  const colors = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#14b8a6", // Teal
    "#eab308", // Yellow
  ];

  const particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    opacity: number;
  }> = [];

  // Radial burst outward from center-top of modal
  for (let i = 0; i < 90; i++) {
    const angle = (Math.PI * 2 * i) / 90 + (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 9 + 4;
    particles.push({
      x: originX + (Math.random() - 0.5) * 40,
      y: originY + (Math.random() - 0.5) * 20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.cos(angle) * speed * 1.2,
      vy: Math.sin(angle) * speed * 0.8 - 4, // Bias initial burst upwards
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let animationFrameId: number;
  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const elapsed = Date.now() - startTime;
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // Gravity simulation
      p.vx *= 0.97; // Drag
      p.rotation += p.vRot;

      if (elapsed > 1600) {
        p.opacity = Math.max(0, p.opacity - 0.03);
      }

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive && elapsed < 3000) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}

export function PaymentSuccessModal({
  open,
  onOpenChange,
  orderId,
  amount,
}: PaymentSuccessModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      const cleanup = runModalConfetti(canvasRef.current);
      return cleanup;
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden sm:rounded-2xl p-6 sm:p-8 text-center border bg-card shadow-2xl relative z-50 transition-all duration-300">
        {/* Canvas Confetti Layer (Modal Center-Top Burst) */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-50 size-full"
        />

        <div className="flex flex-col items-center space-y-5 pt-2 relative z-10">
          {/* Animated Success Icon with Pop, Bounce & Glowing Pulse Ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
            <div className="absolute size-20 rounded-full bg-emerald-500/10 animate-pulse" />
            <div className="relative grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-500/20 transition-all duration-500 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="size-9 transition-transform duration-300" />
            </div>
          </div>

          {/* Staggered Text Appearance: Stage 1 (Headline) */}
          <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-150 fill-mode-backwards">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="size-3.5" /> Payment Confirmed
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Payment Successful!
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Your order has been placed successfully and is now being processed.
            </p>
          </div>

          {/* Staggered Text Appearance: Stage 2 (Order Summary Card) */}
          {(orderId || amount !== undefined) && (
            <div className="w-full rounded-xl border bg-surface/70 p-4 grid grid-cols-2 gap-3 text-left text-xs my-1 shadow-inner animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-300 fill-mode-backwards">
              {orderId && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Order Reference</p>
                  <p className="font-mono font-bold text-foreground truncate mt-0.5">{orderId}</p>
                </div>
              )}
              {amount !== undefined && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Amount Paid</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{formatPrice(amount)}</p>
                </div>
              )}
            </div>
          )}

          {/* Staggered Text Appearance: Stage 3 (Action Buttons) */}
          <div className="w-full pt-2 flex flex-col sm:flex-row gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-450 fill-mode-backwards">
            <Button
              asChild
              size="lg"
              className="flex-1 gap-2 font-semibold shadow-md transition-transform active:scale-95"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/orders">
                View Order <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 gap-2 text-xs font-medium transition-transform active:scale-95"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/products">
                <ShoppingBag className="size-4" /> Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
