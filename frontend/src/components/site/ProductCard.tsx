import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart, formatPrice } from "@/context/cart-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  const outOfStock = Number(product.stock) === 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) < 10;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setAdding(true);
      await add(product);
      toast.success(`Added ${product.name} to cart`);
    } catch {
      // Toast error is handled inside useCart add method
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-all hover:border-foreground/20 hover:shadow-md">
      <Link
        to="/products/$id"
        params={{ id: product.product_id }}
        className="relative block h-52 overflow-hidden bg-surface"
      >
        <img
          src={
            product.image_url ||
            `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <span className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>{product.brand}</span>
            <span className="text-muted-foreground">•</span>
            <span>{product.category}</span>

            {lowStock && <Badge variant="secondary">Low Stock</Badge>}
          </div>

          <Link to="/products/$id" params={{ id: product.product_id }} className="mt-2 block">
            <h3 className="line-clamp-2 text-sm font-medium hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/40">
          <div>
            <span className="text-base font-semibold">{formatPrice(product.price)}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
          >
            {adding ? (
              <span className="flex items-center gap-1">
                <Loader2 className="size-3.5 animate-spin" /> Adding
              </span>
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}