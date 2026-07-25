import { SlidersHorizontal, ChevronDown, RotateCcw, X, Check, ArrowUpDown } from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onResetFilters: () => void;
  searchQuery: string;
  sortOption: string;
  onSelectSort?: (sort: string) => void;
}

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export const ProductFilters = memo(function ProductFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
  searchQuery,
  sortOption,
  onSelectSort,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    searchQuery.trim() !== "" ||
    sortOption !== "featured";

  const activeCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (sortOption !== "featured" ? 1 : 0);

  // Helper for human-readable sort labels
  const getSortLabel = (sort: string) => {
    if (sort === "price-asc") return "Price: Low to High";
    if (sort === "price-desc") return "Price: High to Low";
    if (sort === "featured") return "Featured";
    return sort;
  };

  // Construct active filter summary text
  const summaryParts: string[] = [];
  if (selectedCategory !== "All") {
    summaryParts.push(selectedCategory);
  }
  if (searchQuery.trim() !== "") {
    summaryParts.push(`Search: ${searchQuery.trim()}`);
  }
  if (sortOption !== "featured") {
    summaryParts.push(getSortLabel(sortOption));
  }

  const summaryText = summaryParts.join(" • ");

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto z-30">
      {/* Compact Filter Summary Bar (Collapsed View) */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 w-full sm:w-auto items-center justify-between gap-2.5 rounded-xl px-4 text-sm font-semibold border transition-all ${
          hasActiveFilters
            ? "border-primary/50 bg-primary/5 text-foreground shadow-sm hover:bg-primary/10"
            : "bg-card shadow-soft hover:bg-muted/60"
        }`}
        aria-expanded={isOpen}
        aria-label="Toggle filters panel"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <SlidersHorizontal
            className={`size-4 shrink-0 ${
              hasActiveFilters ? "text-primary" : "text-muted-foreground"
            }`}
          />
          {hasActiveFilters ? (
            <div className="flex items-center gap-2 truncate text-xs sm:text-sm">
              <span className="font-semibold text-foreground shrink-0">Filters:</span>
              <span className="text-muted-foreground truncate max-w-[180px] sm:max-w-[280px] md:max-w-[360px] font-normal">
                {summaryText}
              </span>
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0.5 font-semibold shrink-0 bg-primary/15 text-primary border-primary/20"
              >
                {activeCount}
              </Badge>
            </div>
          ) : (
            <span className="text-foreground">Filters</span>
          )}
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Floating Dropdown Panel (Positioned Absolute - No Layout Shift) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full sm:w-80 md:w-96 rounded-xl border bg-card p-4 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b pb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter Options
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Section A: Categories Vertical Stack */}
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Category
            </p>
            <div className="flex flex-col space-y-1 max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => {
                const isSelected = selectedCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSelectCategory(c)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`grid size-4 shrink-0 place-items-center rounded border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background"
                        }`}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium">{c}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Sort Options */}
          {onSelectSort && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <ArrowUpDown className="size-3" /> Sort By
              </p>
              <div className="flex flex-col space-y-1">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelectSort(opt.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`grid size-4 shrink-0 place-items-center rounded-full border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section C: Reset Section & Done Button */}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={onResetFilters}
            >
              <RotateCcw className="mr-1.5 size-3" /> Reset all
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

