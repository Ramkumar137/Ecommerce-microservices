import { Outlet, Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import authHeroImg from "@/assets/auth-hero.jpg";

const PERKS = [
  { icon: Truck, text: "Free delivery on orders above ₹4,000" },
  { icon: ShieldCheck, text: "Secure checkout & buyer protection" },
  { icon: RefreshCcw, text: "Hassle-free 30-day returns" },
];

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* ── Left: Branded Panel with Ecommerce / Chemistry Theme Image ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12 text-white">
        {/* Background Image & Dark Overlay */}
        <img
          src={authHeroImg}
          alt="HeisenFlow Authentication"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a120a]/95 via-[#0d1f0d]/75 to-black/60" />

        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-[#c8a800]/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit z-10">
          <div className="grid size-8 place-items-center rounded-lg bg-[#c8a800] text-[#1a1a00] text-sm font-bold shadow">
            H
          </div>
          <span className="text-lg font-bold tracking-tight text-white">HeisenFlow</span>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8 my-auto py-8 z-10">
          {/* Tagline */}
          <div>
            <span className="inline-block rounded-full border border-[#c8a800]/40 bg-[#c8a800]/20 px-3 py-1 text-xs font-semibold text-[#eab308] mb-4 shadow-sm backdrop-blur-md">
              🧪 Premium ecommerce, no half measures
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
              Cook up great<br />deals every day.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 max-w-sm">
              Quality products, transparent pricing, and fast delivery — straight to your door.
            </p>
          </div>

          {/* Perks list — real, no fake stats */}
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Icon className="size-3.5 text-[#eab308]" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* Decorative motto */}
          <blockquote className="rounded-xl border border-white/15 bg-black/40 px-5 py-4 backdrop-blur-md">
            <p className="text-sm italic text-slate-200 leading-relaxed">
              "Say my name… say my savings."
            </p>
            <footer className="mt-1.5 text-xs text-slate-400 font-medium">— HeisenFlow motto</footer>
          </blockquote>
        </div>

        <p className="relative text-xs text-slate-400 z-10">© {new Date().getFullYear()} HeisenFlow. All rights reserved.</p>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex flex-col bg-background">
        {/* Mobile logo */}
        <div className="flex items-center justify-between border-b px-6 py-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-md bg-foreground text-background text-xs font-bold">H</div>
            <span className="text-[15px] font-semibold tracking-tight">HeisenFlow</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
