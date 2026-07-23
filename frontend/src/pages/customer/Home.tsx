import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { productsApi } from "@/api/products";
import type { Product } from "@/types/product";

function Landing() {
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

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 8).length > 0 ? products.slice(4, 8) : products.slice(0, 4);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Considered products,<br /> built to last.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              A curated microservices-powered ecommerce experience. Free shipping on orders over $50, easy returns for 30 days.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  Shop the collection <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Truck className="mt-0.5 size-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Free shipping</p>
                  <p>Orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCcw className="mt-0.5 size-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">30-day returns</p>
                  <p>No questions asked</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">2-year warranty</p>
                  <p>On every product</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="row-span-2 aspect-[3/5] rounded-xl bg-muted animate-pulse" />
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {featured.map((p, i) => (
                  <Link
                    key={p.product_id}
                    to="/products/$id"
                    params={{ id: p.product_id }}
                    className={`group relative overflow-hidden rounded-xl border bg-card shadow-soft ${
                      i === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"
                    }`}
                  >
                    <img
                      src={
                        p.image_url ||
                        `https://placehold.co/600x600?text=${encodeURIComponent(p.name)}`
                      }
                      alt={p.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute bottom-3 left-3 right-3 rounded-md bg-background/95 px-3 py-2 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-sm font-medium">{p.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
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
      )}

      {/* Trending */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Featured products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Top quality items selected for you.</p>
            </div>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              Shop all →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
