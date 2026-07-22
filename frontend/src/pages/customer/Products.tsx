import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/api/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

function ProductListing() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [price, setPrice] = useState<[number, number]>([0, 2000000]);
  const [products, setProducts] = useState<Product[]>([]);
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((p) => p.category)),
    ];
  }, [products]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (cat !== "All") {
      list = list.filter((p) => p.category === cat);
    }

    if (q) {
      const keyword = q.toLowerCase();

      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.brand.toLowerCase().includes(keyword)
      );
    }

    list = list.filter(
      (p) =>
        Number(p.price) >= price[0] &&
        Number(p.price) <= price[1]
    );

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
    }

    return list;
  }, [products, cat, q, price, sort]);

  async function loadProducts() {
  try {
    const data = await productsApi.list();
    console.log(data);
    const formatted: Product[] = data
      .filter((p: any) => p.is_active)
      .map((p: any) => ({
        product_id: p.product_id,
        name: p.name,
        description: p.description ?? "",
        brand: p.brand ?? "Unknown",
        category: p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase(),
        price: Number(p.price),
        stock: Number(p.stock),
        image_url: p.image_url ?? "",
        is_active: p.is_active,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

    setProducts(formatted);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
  if (loading) {
  return (
      <div className="flex items-center justify-center py-20">
        Loading products...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="All products"
        description={`${filtered.length} of ${products.length} items`}
        actions={
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
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
                      cat === c ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price range</p>
              <Slider
                value={price}
                max={2000}
                step={10}
                onValueChange={(v) => setPrice(v as [number, number])}
                className="mt-4"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>${price[0]}</span><span>${price[1]}</span>
              </div>
            </div> */}

            <Button variant="outline" size="sm" className="mt-6 w-full" onClick={() => { setCat("All"); setPrice([0, 2000]); setQ(""); }}>
              Reset filters
            </Button>
          </div>
        </aside>

        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products…" className="h-11 pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={PackageSearch}
                title="No products match your filters"
                description="Try adjusting your search or category."
                action={<Button onClick={() => { setCat("All"); setQ(""); setPrice([0, 2000]); }}>Reset</Button>}
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (<ProductCard key={p.product_id} product={p}/>))}
            </div>
          )}

          {filtered.length > 6 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListing;
