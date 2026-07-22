import { PageHeader } from "@/components/common/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function SettingsPage() {
  const groups = [
    { title: "Notifications", items: [
      { key: "orders", label: "Order updates", desc: "Get notified about the status of your orders." },
      { key: "promos", label: "Promotions", desc: "Occasional emails about sales and new arrivals." },
      { key: "digest", label: "Weekly digest", desc: "A curated selection every Monday." },
    ]},
    { title: "Preferences", items: [
      { key: "dark", label: "Dark mode", desc: "Use a darker theme for lower-light environments." },
      { key: "reduce", label: "Reduce motion", desc: "Minimize non-essential animations." },
    ]},
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title="Settings" description="Customize your account experience." />
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <div key={g.title} className="rounded-xl border bg-card">
            <div className="border-b p-5"><h3 className="text-sm font-semibold">{g.title}</h3></div>
            <ul className="divide-y">
              {g.items.map((it) => (
                <li key={it.key} className="flex items-center justify-between gap-4 p-5">
                  <div><Label htmlFor={it.key} className="text-sm font-medium text-foreground">{it.label}</Label><p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p></div>
                  <Switch id={it.key} defaultChecked={it.key === "orders"} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
