import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { inventoryApi } from "@/api/inventory";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { InventoryItem } from "@/types/inventory";
import type { Product } from "@/types/product";

function AdminInventory() {
  const [filter, setFilter] = useState("all");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [stockForm, setStockForm] = useState({
    stock: 0,
    reserved_stock: 0,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    try {
      setLoading(true);
      const [invData, prodData] = await Promise.all([
        inventoryApi.list().catch(() => []),
        productsApi.list().catch(() => []),
      ]);

      setInventory(Array.isArray(invData) ? invData : []);

      const pMap: Record<string, Product> = {};
      if (Array.isArray(prodData)) {
        prodData.forEach((p) => {
          pMap[p.product_id] = p;
        });
      }
      setProductsMap(pMap);
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }

  interface InventoryView {
    productId: string;
    totalStock: number;
    reservedStock: number;
    availableStock: number;
  }

  function handleEditClick(item: InventoryItem) {
    setSelectedItem(item);
    setStockForm({
      stock: item.total_stock,
      reserved_stock: item.reserved_stock,
    });
    setEditOpen(true);
  }

  async function handleSaveStock() {
    if (!selectedItem) return;
    try {
      setUpdating(true);
      await inventoryApi.update(selectedItem.product_id,{
        stock: stockForm.stock,
        reserved_stock: stockForm.reserved_stock,
      });
      toast.success("Stock level updated");
      setEditOpen(false);
      loadInventoryData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  }

  const filtered = inventory.filter((item) => {
    if (filter === "out") return item.available_stock === 0;
    if (filter === "low") return item.available_stock > 0 && item.available_stock < 15;
    if (filter === "ok") return item.available_stock >= 15;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${filtered.length} tracked items`}
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="ok">In stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product ID</Label>
              <Input value={selectedItem?.product_id || ""} disabled className="mt-1" />
            </div>
            <div>
              <Label>Reserved Stock</Label>
                <Input
                    type="number"
                    value={stockForm.reserved_stock}
                    onChange={(e)=>
                        setStockForm({
                            ...stockForm,
                            reserved_stock:Number(e.target.value)
                        })
                    }
                />
            </div>
            <div>
              <Label>Total Stock</Label>
              <Input
                type="number"
                value={stockForm.stock}
                onChange={(e) =>
                  setStockForm({ ...stockForm, stock: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} disabled={updating}>
              {updating ? "Saving..." : "Save Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-soft">
        {loading ? (
          <div className="space-y-0 divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="size-10 rounded-md bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Product ID</th>
                <th className="px-5 py-3 font-medium">Stock Level</th>
                <th className="px-5 py-3 font-medium">Reserved</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => {
                const prod = productsMap[item.product_id];
                const pName = prod?.name || "Product";
                const pCat = prod?.category || "Inventory";
                const pImg =
                  prod?.image_url ||
                  `https://placehold.co/80x80?text=${encodeURIComponent(pName)}`;

                return (
                  <tr key={item.product_id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={pImg} alt="" className="size-10 rounded-md border object-cover" />
                        <div>
                          <p className="font-medium">{pName}</p>
                          <p className="text-xs text-muted-foreground">{pCat}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {item.product_id}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={item.total_stock ? (item.available_stock / item.total_stock) * 100: 0}
                          className="h-1.5 w-32"
                        />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.available_stock} / {item.total_stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {item.reserved_stock} reserved
                    </td>
                    <td className="px-5 py-3">
                      {item.available_stock === 0 ? (
                        <Badge variant="outline" className="border-destructive/30 text-destructive">
                          Out of stock
                        </Badge>
                      ) : item.available_stock < 15 ? (
                        <Badge variant="secondary">Low stock</Badge>
                      ) : (
                        <Badge variant="outline" className="border-success/30 text-success">
                          In stock
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                        Edit Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AdminInventory;
