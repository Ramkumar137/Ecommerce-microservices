import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function AdminSettings() {
  return (
    <>
      <PageHeader title="Store settings" description="Manage your storefront configuration." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1 text-sm">
          {["General", "Payments", "Shipping", "Taxes", "Notifications"].map((s, i) => (
            <button key={s} className={`block w-full rounded-md px-3 py-2 text-left transition-colors ${i === 0 ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>{s}</button>
          ))}
        </aside>
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold">General</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><Label>Store name</Label><Input defaultValue="HeisenFlow" className="mt-1.5" /></div>
            <div><Label>Support email</Label><Input defaultValue="hello@heisenflow.co" className="mt-1.5" /></div>
            <div className="sm:col-span-2"><Label>Store description</Label><Textarea rows={3} defaultValue="Considered products, built to last." className="mt-1.5" /></div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t pt-6">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;
