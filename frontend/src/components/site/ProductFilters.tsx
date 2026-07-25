import { SlidersHorizontal, ChevronDown, RotateCcw, X, Check } from "lucide-react";
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
}

export const ProductFilters = memo(function ProductFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
  searchQuery,
  sortOption,
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

  const activeCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (sortOption !== "featured" ? 1 : 0);

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto z-30">
      {/* Filter Toggle Button (same row as search bar) */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-full sm:w-auto items-center justify-between gap-2.5 rounded-xl px-4 text-sm font-semibold border bg-card shadow-soft hover:bg-muted/60"
        aria-expanded={isOpen}
        aria-label="Toggle filters panel"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0.5 font-semibold">
              {activeCount}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
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

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Category
            </p>
            {/* Clean Vertical Stacked Layout */}
            <div className="flex flex-col space-y-1 max-h-64 overflow-y-auto pr-1">
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
                      {/* Checkbox Indicator Box */}
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
