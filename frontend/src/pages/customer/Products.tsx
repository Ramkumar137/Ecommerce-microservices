import { Search, SlidersHorizontal, PackageSearch, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { productsService } from "@/api/services/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";

function ProductListing() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getProducts();
      const activeProducts: Product[] = (Array.isArray(data) ? data : [])
        .filter((p) => p.is_active !== false)
        .map((p) => ({
          product_id: p.product_id,
          name: p.name,
          description: p.description ?? "",
          brand: p.brand ?? "Brand",
          category: p.category
            ? p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase()
            : "General",
          price: Number(p.price),
          stock: Number(p.stock),
          image_url: p.image_url ?? "",
          is_active: p.is_active ?? true,
          created_at: p.created_at ?? "",
          updated_at: p.updated_at ?? "",
        }));

      setProducts(activeProducts);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to load products. Please try again.";
      setError(errorMessage);
      toast.error("Failed to load products from server");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (cat !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (q.trim()) {
      const keyword = q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.brand.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword)
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      default:
        break;
    }

    return list;
  }, [products, cat, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="All products"
        description={`${filtered.length} of ${products.length} items`}
        actions={
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" /> Filters
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</p>
              <div className="mt-2 space-y-0.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                      cat === c
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full"
              onClick={() => {
                setCat("All");
                setQ("");
                setSort("featured");
              }}
            >
              Reset filters
            </Button>
          </div>
        </aside>

        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name, brand, category…"
              className="h-11 pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-lg border bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6">
              <EmptyState
                icon={AlertCircle}
                title="Unable to load products"
                description={error}
                action={
                  <Button onClick={loadProducts} variant="default">
                    Try Again
                  </Button>
                }
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={PackageSearch}
                title="No products match your filters"
                description="Try adjusting your search query or selecting a different category."
                action={
                  <Button
                    onClick={() => {
                      setCat("All");
                      setQ("");
                    }}
                  >
                    Reset filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListing;
