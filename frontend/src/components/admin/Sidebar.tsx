import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, CreditCard, Boxes, Settings, ArrowLeft } from "lucide-react";
import { useState } from "react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open }: { open: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 border-r bg-sidebar transition-[width] duration-200 ${
        open ? "w-60" : "w-16"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-background text-xs font-bold">H</div>
        {open && <span className="text-[15px] font-semibold tracking-tight">HeisenFlow</span>}
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-sidebar-accent text-foreground font-medium" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {open && <span className="truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="absolute inset-x-0 bottom-0 border-t p-2">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {open && <span>Back to store</span>}
        </Link>
      </div>
    </aside>
  );
}

export function useSidebarState() {
  const [open, setOpen] = useState(true);
  return { open, setOpen, toggle: () => setOpen((v) => !v) };
}
