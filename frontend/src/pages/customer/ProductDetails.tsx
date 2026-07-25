import { useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Minus, Plus, ShieldCheck, Truck, RefreshCcw, Check, AlertCircle } from "lucide-react";
import { productsService } from "@/api/services/products";
import { inventoryApi } from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart, formatPrice } from "@/context/cart-context";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function ProductDetail() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [stockCount, setStockCount] = useState<number>(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadProductData();
  }, [id]);

  async function loadProductData() {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch main product info and related products list
      const [prodData, allProducts] = await Promise.all([
        productsService.getProductById(id),
        productsService.getProducts().catch(() => []),
      ]);

      const mappedProduct: Product = {
        product_id: prodData.product_id,
        name: prodData.name,
        description: prodData.description || "",
        brand: prodData.brand || "Brand",
        category: prodData.category
          ? prodData.category.charAt(0).toUpperCase() + prodData.category.slice(1).toLowerCase()
          : "General",
        price: Number(prodData.price),
        stock: Number(prodData.stock),
        image_url: prodData.image_url || "",
        is_active: prodData.is_active ?? true,
        created_at: prodData.created_at || "",
        updated_at: prodData.updated_at || "",
      };

      setProduct(mappedProduct);
      setStockCount(mappedProduct.stock);

      // 2. Fetch stock count from Inventory API separately
      try {
        const inv = await inventoryApi.get(id);
        if (inv && typeof inv.available_stock === "number") {
          setStockCount(inv.available_stock);
        } else if (inv && typeof inv.total_stock === "number") {
          setStockCount(inv.total_stock);
        }
      } catch {
        // Fallback to stock field from product if inventory API fails/unreachable
        setStockCount(mappedProduct.stock);
      }

      // Map related items
      if (Array.isArray(allProducts)) {
        const otherProds = allProducts
          .filter((p) => p.product_id !== id)
          .slice(0, 4)
          .map((p) => ({
            product_id: p.product_id,
            name: p.name,
            description: p.description || "",
            brand: p.brand || "Brand",
            category: p.category || "General",
            price: Number(p.price),
            stock: Number(p.stock),
            image_url: p.image_url || "",
            is_active: p.is_active ?? true,
            created_at: p.created_at || "",
            updated_at: p.updated_at || "",
          }));
        setRelated(otherProds);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Unable to load product information.";
      setError(errorMessage);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-1/4 rounded bg-muted animate-pulse" />
            <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-24 w-full rounded bg-muted animate-pulse" />
            <div className="h-12 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-20 sm:px-6 lg:px-10">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load product"
          description={error}
          action={
            <div className="flex items-center gap-3">
              <Button onClick={loadProductData} variant="default">
                Try Again
              </Button>
              <Button asChild variant="outline">
                <Link to="/products">Back to products</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 py-20 sm:px-6 lg:px-10">
        <EmptyState
          icon={AlertCircle}
          title="Product not found"
          description="The product you are looking for does not exist or has been removed."
          action={
            <Button asChild variant="default">
              <Link to="/products">Back to products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const gallery = product.image_url
    ? [product.image_url]
    : [`https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`];

  const outOfStock = stockCount <= 0;

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
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
                  className={`aspect-square overflow-hidden rounded-lg border transition-all ${
                    active === i ? "ring-2 ring-primary ring-offset-2" : "hover:border-foreground/30"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand} • {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-4 fill-warning text-warning" />
              ))}
            </div>
            <span className="font-medium">4.8</span>
            <span className="text-muted-foreground">· Verified customer reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Stock availability */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            {!outOfStock ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" /> In stock ({stockCount} available)
                </span>
                <span className="text-muted-foreground">· Ships in 1–2 business days</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                Out of stock
              </span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-md border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-10 place-items-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(stockCount || 99, q + 1))}
                className="grid size-10 place-items-center text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              size="lg"
              disabled={outOfStock}
              onClick={() => {
                add(product, qty);
                toast.success(`Added ${qty} × ${product.name} to cart`);
              }}
            >
              Add to cart
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border bg-surface p-4 text-xs">
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 size-4 text-foreground" />
              <div>
                <p className="font-medium text-foreground">Free shipping</p>
                <p className="text-muted-foreground">Over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RefreshCcw className="mt-0.5 size-4 text-foreground" />
              <div>
                <p className="font-medium text-foreground">30-day returns</p>
                <p className="text-muted-foreground">No fuss</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 text-foreground" />
              <div>
                <p className="font-medium text-foreground">2-year warranty</p>
                <p className="text-muted-foreground">Every product</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="specs" className="mt-10">
            <TabsList>
              <TabsTrigger value="specs">Product Info</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-4">
              <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Brand:</strong> {product.brand}</p>
                <p><strong className="text-foreground">Category:</strong> {product.category}</p>
                <p><strong className="text-foreground">Product ID:</strong> {product.product_id}</p>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              Free standard shipping on all orders over $50. Expedited and international shipping available at checkout.
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <h2 className="text-xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
