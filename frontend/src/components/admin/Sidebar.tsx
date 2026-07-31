import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, CreditCard, Boxes, Settings, ArrowLeft, Users, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Only close sidebar on menu click on mobile viewports (< 768px)
  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar transition-[width] duration-200 ${
          open ? "w-60" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-background text-xs font-bold">
            H
          </div>
          {open && <span className="text-[15px] font-semibold tracking-tight">HeisenFlow</span>}
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={handleNavClick}
                title={!open ? it.label : undefined}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors relative ${
                  active
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {open && <span className="truncate">{it.label}</span>}
                {/* Active indicator dot when collapsed */}
                {!open && active && (
                  <span className="absolute left-[52px] size-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to store */}
        <div className="shrink-0 border-t p-2">
          <Link
            to="/"
            title={!open ? "Back to store" : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4 shrink-0" />
            {open && <span>Back to store</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}

export function useSidebarState() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sidebar_open");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return true; // Default OPEN
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_sidebar_open", String(next));
      }
      return next;
    });
  };

  return { open, setOpen, toggle };
}
