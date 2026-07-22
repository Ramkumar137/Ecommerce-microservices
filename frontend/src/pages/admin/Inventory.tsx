import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { products } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

function AdminInventory() {
  const [filter, setFilter] = useState("all");
  const filtered = products.filter((p) => {
    if (filter === "out") return p.stock === 0;
    if (filter === "low") return p.stock > 0 && p.stock < 15;
    if (filter === "ok") return p.stock >= 15;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${filtered.length} items`}
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="ok">In stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Stock level</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="size-10 rounded-md border object-cover" />
                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.id.toUpperCase()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min(100, (p.stock / 80) * 100)} className="h-1.5 w-32" />
                    <span className="text-xs tabular-nums text-muted-foreground">{p.stock}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {p.stock === 0
                    ? <Badge variant="outline" className="border-destructive/30 text-destructive">Out</Badge>
                    : p.stock < 15
                    ? <Badge variant="secondary">Low</Badge>
                    : <Badge variant="outline" className="border-success/30 text-success">In stock</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminInventory;
