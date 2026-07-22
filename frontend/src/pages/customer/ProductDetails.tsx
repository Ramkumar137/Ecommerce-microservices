import { useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Minus, Plus, ShieldCheck, Truck, RefreshCcw, Check } from "lucide-react";
import { getProduct, products } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart, formatPrice } from "@/context/cart-context";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function ProductDetail() {
  const { id } = useParams({ from: "/_site/products/$id" });
  const product = getProduct(id)!;
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const gallery = product.images ?? [product.image];
  const [active, setActive] = useState(0);

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/products">Shop</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border bg-surface">
            <img src={gallery[active]} alt={product.name} className="size-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((src: string, i: number) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden rounded-lg border transition-all ${active === i ? "ring-2 ring-primary ring-offset-2" : "hover:border-foreground/30"}`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`size-4 ${i < Math.round(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
              ))}
            </div>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {product.reviews.toLocaleString()} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                <Badge className="bg-success/10 text-success hover:bg-success/10">Save {formatPrice(product.originalPrice - product.price)}</Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <><Check className="size-4 text-success" /><span className="text-foreground">In stock</span><span className="text-muted-foreground">· ships in 1–2 business days</span></>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-md border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-10 place-items-center text-muted-foreground hover:text-foreground" aria-label="Decrease">
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid size-10 place-items-center text-muted-foreground hover:text-foreground" aria-label="Increase">
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              size="lg"
              disabled={product.stock === 0}
              onClick={() => {
                add(product, qty);
                toast.success(`Added ${qty} × ${product.name} to cart`);
              }}
            >
              Add to cart
            </Button>
            <Button asChild size="lg" variant="outline" disabled={product.stock === 0}>
              <Link to="/checkout" onClick={() => add(product, qty)}>Buy now</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border bg-surface p-4 text-xs">
            <div className="flex items-start gap-2"><Truck className="mt-0.5 size-4 text-foreground" /><div><p className="font-medium text-foreground">Free shipping</p><p className="text-muted-foreground">Over $50</p></div></div>
            <div className="flex items-start gap-2"><RefreshCcw className="mt-0.5 size-4 text-foreground" /><div><p className="font-medium text-foreground">30-day returns</p><p className="text-muted-foreground">No fuss</p></div></div>
            <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 text-foreground" /><div><p className="font-medium text-foreground">2-year warranty</p><p className="text-muted-foreground">Every product</p></div></div>
          </div>

          {/* Specs / Tabs */}
          <Tabs defaultValue="specs" className="mt-10">
            <TabsList>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-4">
              <dl className="grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {product.specs.map((s: { label: string; value: string }, i: number) => (
                  <div key={s.label} className={`flex justify-between p-4 text-sm ${i > 1 ? "sm:border-t" : ""}`}>
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              Free standard shipping on all orders over $50. Expedited and international shipping available at checkout.
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              {product.reviews.toLocaleString()} verified reviews averaging {product.rating.toFixed(1)} out of 5.
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <h2 className="text-xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
