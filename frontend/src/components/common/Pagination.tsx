import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  // Hide pagination if only 1 page or no items
  if (totalPages <= 1 || totalItems <= itemsPerPage) {
    return null;
  }

  // Looping Navigation Logic
  const handlePrevious = () => {
    if (currentPage === 1) {
      onPageChange(totalPages); // Loop to last page
    } else {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage === totalPages) {
      onPageChange(1); // Loop to first page
    } else {
      onPageChange(currentPage + 1);
    }
  };

  // Smart Page Numbers Generator (Current ±1 with Ellipses)
  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    const delta = 1; // current page ±1

    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      pages.push(1, "...");
    } else {
      pages.push(1);
    }

    pages.push(...range);

    if (currentPage + delta < totalPages - 1) {
      pages.push("...", totalPages);
    } else if (totalPages > 1) {
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row sm:justify-between w-full">
      {/* Range summary counter */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> products
      </p>

      {/* Pagination control buttons */}
      <div className="flex items-center gap-2">
        {/* Previous Button with Left Arrow */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 px-3 text-xs font-medium border bg-background shadow-xs hover:bg-muted"
          aria-label="Previous page"
        >
          <ChevronLeft className="mr-1 size-4 text-muted-foreground" /> Previous
        </Button>

        {/* Smart Visible Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) =>
            typeof page === "number" ? (
              <Button
                key={idx}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`size-8 p-0 text-xs font-medium border ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  if (page !== currentPage) {
                    onPageChange(page);
                  }
                }}
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="px-1 text-xs text-muted-foreground select-none">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Button with Right Arrow */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 px-3 text-xs font-medium border bg-background shadow-xs hover:bg-muted"
          aria-label="Next page"
        >
          Next <ChevronRight className="ml-1 size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
});
