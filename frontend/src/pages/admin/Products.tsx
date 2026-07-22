import { MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/api/products";
import type { Product } from "@/types/product";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/context/cart-context";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import ImageUploader from "@/components/common/ImageUploader";

function AdminProducts() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const emptyProduct = {
    name: "",
    description: "",
    brand: "",
    category: "",
    price: 0,
    stock: 0,
    image_url: "",
    is_active: true,
  };

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState(emptyProduct);

  const [creating, setCreating] = useState(false);


  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        cat === "All" || p.category === cat;

      const keyword = q.toLowerCase();

      const matchesSearch =
        p.name.toLowerCase().includes(keyword) ||
        p.brand.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [products, q, cat]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((p) => p.category)),
    ];
  }, [products]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await productsApi.list();

      const formatted: Product[] = data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        stock: Number(p.stock),
      }));

      setProducts(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    try {
      setCreating(true);

      await productsApi.create({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      toast.success("Product created successfully");

      setOpenCreate(false);
      setFormData(emptyProduct);

      loadProducts();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ??
        "Failed to create product."
      );
    } finally {
      setCreating(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      description: product.description || "",
      brand: product.brand || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || "",
      is_active: product.is_active,
    });

    setOpenEdit(true);
  }

  async function handleDelete(productId: string) {
    const ok = window.confirm(
      "Delete this product?"
    );

    if (!ok) return;

    try {
      await productsApi.remove(productId);

      toast.success("Product deleted");

      loadProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  }

  async function handleUpdate() {
    if (!editingProduct) return;

    try {
      await productsApi.update(
        editingProduct.product_id,
        formData
      );

      toast.success("Product updated");

      setOpenEdit(false);

      loadProducts();
    } catch {
      toast.error("Update failed");
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
    <>
      <PageHeader
        title="Products"
        description={`${filtered.length} products`}
        actions={
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> New product</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New product</DialogTitle></DialogHeader>
              <div className="grid gap-4">

                <div>
                  <Label>Name</Label>

                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Description</Label>

                  <Textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <Label>Brand</Label>

                    <Input
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Category</Label>

                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <Label>Price</Label>

                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Stock</Label>

                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                </div>

                <div>
                  <Label>Image URL</Label>
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image_url: e.target.value,
                        })
                      }
                    />
                    {formData.image_url && (
                      <div className="mt-3 overflow-hidden rounded-lg border">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="h-40 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/600x400?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    )}

                </div>
                
              </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenCreate(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={createProduct}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Product"}
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">

            <div>
              <Label>Name</Label>

              <Input
                value={formData.name}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    name:e.target.value
                  })
                }
              />
            </div>

            <div>
              <Label>Description</Label>

              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    description:e.target.value
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>Brand</Label>

                <Input
                  value={formData.brand}
                  onChange={(e)=>
                    setFormData({
                      ...formData,
                      brand:e.target.value
                    })
                  }
                />
              </div>

              <div>
                <Label>Category</Label>

                <Input
                  value={formData.category}
                  onChange={(e)=>
                    setFormData({
                      ...formData,
                      category:e.target.value
                    })
                  }
                />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>Price</Label>

                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e)=>
                    setFormData({
                      ...formData,
                      price:Number(e.target.value)
                    })
                  }
                />
              </div>

              <div>
                <Label>Stock</Label>

                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e)=>
                    setFormData({
                      ...formData,
                      stock:Number(e.target.value)
                    })
                  }
                />
              </div>

            </div>

            <div>
              <Label>Image URL</Label>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image_url: e.target.value,
                    })
                  }
                />
                {formData.image_url && (
                  <div className="mt-3 overflow-hidden rounded-lg border">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setOpenEdit(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleUpdate}>
              Update Product
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.product_id} className="hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          p.image_url ||
                          `https://placehold.co/80x80?text=${encodeURIComponent(p.name)}`
                        }
                        alt={p.name}
                        className="size-10 shrink-0 rounded-md border object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.product_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3">
                    {p.stock === 0
                      ? <Badge variant="outline" className="border-destructive/30 text-destructive">Out of stock</Badge>
                      : p.stock < 15
                      ? <Badge variant="secondary">Low · {p.stock}</Badge>
                      : <span className="text-muted-foreground">{p.stock}</span>}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.brand}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(p)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.product_id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t bg-surface/40 px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {products.length}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminProducts;
