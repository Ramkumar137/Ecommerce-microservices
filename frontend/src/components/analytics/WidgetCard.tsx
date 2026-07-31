import { memo } from "react";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  loading: boolean;
  error: boolean;
  empty: boolean;
  refetching?: boolean;
  onRetry?: () => void;
  /** Height of the chart area — used to size skeletons correctly */
  chartHeight?: number;
  children: ReactNode;
  className?: string;
}

/** Skeleton shaped like a bar/line chart: axis stubs + shimmer bars */
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="flex gap-2" style={{ height }}>
      {/* Y-axis stub */}
      <div className="flex flex-col justify-between py-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-7" />
        ))}
      </div>
      {/* Chart area */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Bars shimmer */}
        <div className="flex flex-1 items-end gap-2 px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${40 + ((i * 37) % 55)}%` }}
            />
          ))}
        </div>
        {/* X-axis stub */}
        <div className="flex justify-between px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

export const WidgetCard = memo(function WidgetCard({
  title,
  loading,
  error,
  empty,
  refetching = false,
  onRetry,
  chartHeight = 220,
  children,
  className = "",
}: WidgetCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-soft ${className}`}>
      {/* Header: title + background-refetch spinner */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {refetching && !loading && (
          <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {loading ? (
        <ChartSkeleton height={chartHeight} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ height: chartHeight }}>
          <AlertCircle className="size-6 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load data for this widget.</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 text-xs">
              <RefreshCw className="size-3" />
              Retry
            </Button>
          )}
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center gap-2 text-center" style={{ height: chartHeight }}>
          <Inbox className="size-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No analytics data available.</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
});
