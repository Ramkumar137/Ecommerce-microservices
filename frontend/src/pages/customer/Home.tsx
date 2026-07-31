import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Truck, RefreshCcw, ShieldCheck,
  Zap, Shirt, Smartphone, Home as HomeIcon, Dumbbell, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { Footer } from "@/components/site/Footer";
import { productsApi } from "@/api/products";
import type { Product } from "@/types/product";

// ─── Hero Slides ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    badge: "🧪 Say My Name — Say My Deals",
    headline: "Cook Your\nDeals Today",
    sub: "You're the one who knocks… on the best prices. Flash offers on electronics, fashion & more.",
    cta: "Shop the Sale",
    bg: "from-[#1a1a00] to-[#3d3d00]",
    accent: "bg-[#c8a800]",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80",
  },
  {
    id: 2,
    badge: "⚗️ New Arrivals — Just Synthesised",
    headline: "99.1% Pure\nStyle. No Filler.",
    sub: "Freshly curated fashion drops. Every piece, carefully selected. No half measures.",
    cta: "Explore Collection",
    bg: "from-[#0d1f0d] to-[#1a3d1a]",
    accent: "bg-[#4a9e4a]",
    img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900&q=80",
  },
  {
    id: 3,
    badge: "💊 Tech Week — The Blue Stuff",
    headline: "Next-Level Gear\nAt Street Prices",
    sub: "Upgrade your setup. Best-in-class gadgets, no middleman. I am the danger — to high prices.",
    cta: "Browse Tech",
    bg: "from-[#001a33] to-[#003366]",
    accent: "bg-[#1a6bb5]",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&q=80",
  },
];

function getCategoryIcon(cat: string) {
  const icons: Record<string, React.ReactNode> = {
    Electronics: <Smartphone className="size-5" />,
    Fashion: <Shirt className="size-5" />,
    Home: <HomeIcon className="size-5" />,
    Sports: <Dumbbell className="size-5" />,
    Books: <BookOpen className="size-5" />,
  };
  return icons[cat] ?? <Zap className="size-5" />;
}

// ─── Hero Carousel ───────────────────────────────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  const slide = SLIDES[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(180px, 30vw, 360px)" }}>
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${s.bg}`} />
          <img
            src={s.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 flex h-full items-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-xl">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${slide.accent} mb-3`}>
            {slide.badge}
          </span>
          <h1 className="whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {slide.headline}
          </h1>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/70 hidden sm:block">{slide.sub}</p>
          <Button asChild size="sm" className="mt-4 bg-white text-gray-900 hover:bg-white/90 font-semibold">
            <Link to="/products">
              {slide.cta} <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition"
        aria-label="Previous"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={() => { next(); resetTimer(); }}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition"
        aria-label="Next"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-2 bg-white/40"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Trust Bar ───────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="border-b bg-surface">
      {/* <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 px-4">
          <Truck className="size-4 text-primary" />
          <span><strong className="text-foreground">Free shipping</strong> over ₹4,000</span>
        </div>
        <div className="flex items-center justify-center gap-2 px-4">
          <RefreshCcw className="size-4 text-primary" />
          <span><strong className="text-foreground">30-day</strong> easy returns</span>
        </div>
        <div className="flex items-center justify-center gap-2 px-4">
          <ShieldCheck className="size-4 text-primary" />
          <span><strong className="text-foreground">2-year</strong> warranty</span>
        </div>
      </div> */}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {href && (
        <Link to={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return <div className="h-72 rounded-xl bg-muted animate-pulse" />;
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list()
      .then((data) => {
        const active: Product[] = (Array.isArray(data) ? data : [])
          .filter((p) => p.is_active !== false)
          .map((p) => ({
            product_id: p.product_id,
            name: p.name,
            description: p.description || "",
            brand: p.brand || "Brand",
            category: p.category
              ? p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase()
              : "General",
            price: Number(p.price),
            stock: Number(p.stock),
            image_url: p.image_url || "",
            is_active: p.is_active ?? true,
            created_at: p.created_at || "",
            updated_at: p.updated_at || "",
          }));
        setProducts(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const trending = products.slice(0, 8);
  const bestSellers = products.slice(0, 10);
  const newArrivals = [...products].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);

  return (
    <>
      <HeroCarousel />
      <TrustBar />

      {/* Category Shortcuts */}
      {(loading || categories.length > 0) && (
        <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
          <SectionHeader title="Shop by Category" href="/products" />
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 w-28 shrink-0 rounded-xl bg-muted animate-pulse" />
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat}
                    to="/products"
                    className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border bg-card px-5 py-4 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                  >
                    <span className="text-primary">{getCategoryIcon(cat)}</span>
                    {cat}
                  </Link>
                ))}
          </div>
        </section>
      )}

      {/* Trending Products — horizontal scroll */}
      <section className="border-t bg-surface px-4 py-10 sm:px-6 lg:px-10">
        <SectionHeader title="🔥 Trending Products" sub="What everyone's buying right now" href="/products" />
        <div className="mt-6 flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-72 w-52 shrink-0 rounded-xl bg-muted animate-pulse" />
              ))
            : trending.map((p) => (
                <div key={p.product_id} className="w-52 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </section>

      {/* Best Sellers — grid */}
      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <SectionHeader title="⭐ Best Sellers" sub="Top-rated products loved by customers" href="/products" />
        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)
            : bestSellers.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-700 px-8 py-10 text-white">
          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Limited Offer</p>
            <h3 className="mt-2 text-3xl font-bold">Get 20% Off Your First Order</h3>
            <p className="mt-2 text-sm text-white/80">Sign up and use code <strong>WELCOME20</strong> at checkout. No half measures.</p>
            <Button asChild size="lg" className="mt-5 bg-white text-primary hover:bg-white/90 font-semibold">
              <Link to="/auth/register">Claim Offer</Link>
            </Button>
          </div>
          <div className="absolute -right-10 -top-10 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 right-20 size-80 rounded-full bg-white/5" />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="border-t bg-surface px-4 py-10 sm:px-6 lg:px-10">
        <SectionHeader title="✨ New Arrivals" sub="Fresh products just added to the store" href="/products" />
        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : newArrivals.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
