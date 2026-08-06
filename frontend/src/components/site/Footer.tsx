import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Send,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Heart,
  ShoppingBag,
  Package,
  User,
  LayoutDashboard,
  Settings,
  BarChart2,
  Lock,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thank you for subscribing to HeisenFlow updates!");
    setEmail("");
  };

  return (
    <footer className="border-t bg-card/80 backdrop-blur-md mt-16 text-foreground">
      {/* Value Propositions Banner */}
      <div className="border-b bg-surface/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Free Shipping</p>
                <p className="text-[11px] text-muted-foreground">On orders over ₹4,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Secure Checkout</p>
                <p className="text-[11px] text-muted-foreground">256-Bit SSL Encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">30-Day Returns</p>
                <p className="text-[11px] text-muted-foreground">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Headphones className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">24/7 Support</p>
                <p className="text-[11px] text-muted-foreground">Dedicated customer care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info & Newsletter */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-extrabold shadow-sm">
                H
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                HeisenFlow
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Considered products, built to last. Powered by high-performance AWS cloud microservices.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Subscribe for Exclusive Offers
              </p>
              <div className="flex items-center gap-1.5">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs bg-surface"
                  required
                />
                <Button type="submit" size="sm" className="h-9 px-3 gap-1 shrink-0 font-semibold">
                  <Send className="size-3.5" /> Join
                </Button>
              </div>
            </form>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Shop Categories
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/products" search={{ category: "Electronics" }} className="text-muted-foreground hover:text-foreground transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link to="/products" search={{ category: "Fashion" }} className="text-muted-foreground hover:text-foreground transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products" search={{ category: "Home & Living" }} className="text-muted-foreground hover:text-foreground transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/products" search={{ category: "Appliances" }} className="text-muted-foreground hover:text-foreground transition-colors">
                  Kitchen Appliances
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Customer Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Package className="size-3.5" /> Track Orders & History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Heart className="size-3.5 text-red-500" /> My Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <ShoppingBag className="size-3.5" /> Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <User className="size-3.5" /> Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Administration Portal
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="size-3.5 text-primary" /> Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <BarChart2 className="size-3.5 text-primary" /> Real-time Analytics
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Settings className="size-3.5 text-primary" /> Microservices Config
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
