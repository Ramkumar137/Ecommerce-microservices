import { Search, PackageSearch, AlertCircle, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { productsService } from "@/api/services/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilters } from "@/components/site/ProductFilters";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";

// 4 rows in 4-column desktop layout (lg:grid-cols-4) = 16 products per page (4x4)
const ITEMS_PER_PAGE = 16;

function ProductListing() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products once on mount to avoid duplicate API calls
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

  // Filter and sort products
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

  // Reset page to 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [cat, q, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  // Paginated subset of products for the current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = useCallback(() => {
    setCat("All");
    setQ("");
    setSort("featured");
    setCurrentPage(1);
  }, []);

  // Generate pagination page numbers array with smart ellipses
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const hasActiveFilters = cat !== "All" || q.trim() !== "" || sort !== "featured";

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
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

      {/* Row 1: Search Bar (Left - Large Width) + Filters Card (Right - Compact Width) */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-start">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, brand, category…"
            className="h-11 pl-10 text-sm shadow-soft"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Compact Filters Card beside Search Bar */}
        <ProductFilters
          categories={categories}
          selectedCategory={cat}
          onSelectCategory={setCat}
          onResetFilters={handleResetFilters}
          searchQuery={q}
          sortOption={sort}
          onSelectSort={setSort}
        />
      </div>

      {/* Row 2: Featured / Active Filter Summary Section (Below Search & Filters) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 p-3.5 shadow-soft text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Sparkles className="size-3.5 text-amber-500" /> Featured Catalog
          </span>
          {cat !== "All" && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5">
              Category: <span className="font-semibold">{cat}</span>
              <button type="button" onClick={() => setCat("All")} className="hover:text-foreground">
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {q.trim() !== "" && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5">
              Query: <span className="font-semibold">"{q}"</span>
              <button type="button" onClick={() => setQ("")} className="hover:text-foreground">
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> items
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Row 3: FULL WIDTH Product Grid (4 columns on desktop: lg:grid-cols-4) */}
      <main className="mt-6 w-full">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl border bg-muted/40 animate-pulse" />
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
                <Button onClick={handleResetFilters}>
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Full-width Product Grid without sidebar constraints */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>

            {/* Reusable Smart Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default ProductListing;
