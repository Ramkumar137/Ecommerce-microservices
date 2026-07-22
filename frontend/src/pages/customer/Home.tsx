import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/lib/mock-data";

function Landing() {
  const featured = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Considered products,<br /> built to last.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              A curated commerce experience for people who value quality and craft. Free shipping on orders over $50, easy returns for 30 days.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/products">Shop the collection <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/products">Browse new arrivals</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Truck className="mt-0.5 size-4 text-foreground" />
                <div><p className="font-medium text-foreground">Free shipping</p><p>Orders over $50</p></div>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCcw className="mt-0.5 size-4 text-foreground" />
                <div><p className="font-medium text-foreground">30-day returns</p><p>No questions asked</p></div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 text-foreground" />
                <div><p className="font-medium text-foreground">2-year warranty</p><p>On every product</p></div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {featured.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  to="/products/$id"
                  params={{ id: p.id }}
                  className={`group relative overflow-hidden rounded-xl border bg-card shadow-soft ${i === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"}`}
                >
                  <img src={p.image} alt={p.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute bottom-3 left-3 right-3 rounded-md bg-background/95 px-3 py-2 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-medium">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.filter((c) => c !== "All").map((c) => (
            <Link
              key={c}
              to="/products"
              className="flex h-24 items-center justify-center rounded-xl border bg-card text-sm font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-elevated"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Trending this week</h2>
              <p className="mt-1 text-sm text-muted-foreground">Loved by our community.</p>
            </div>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">Shop all →</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-card p-10 text-center shadow-soft sm:p-14">
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Join 40,000+ subscribers</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Early access to new drops, member-only pricing, and thoughtful writing on the products we love.
            </p>
            <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 flex-1 rounded-md border bg-background px-3.5 text-sm outline-none ring-primary/20 focus:ring-2"
              />
              <Button type="submit" size="lg">Subscribe</Button>
            </form>
          </div>
        </div>
      </section> */}
    </>
  );
}

export default Landing;
