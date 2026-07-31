import { Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, PanelLeft, Search } from "lucide-react";
import { useEffect } from "react";
import { AdminSidebar, useSidebarState } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
  BreadcrumbSeparator, BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { getUserInitials } from "@/utils/user";

function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { open, setOpen, toggle } = useSidebarState();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  // Auto-collapse sidebar on mobile (< 768px) on mount
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, [pathname]);

  const initials = user ? getUserInitials(user) : "AM";

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <div className={`transition-[padding] duration-200 ${open ? "md:pl-60" : "md:pl-16"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle sidebar">
            <PanelLeft className="size-5" />
          </Button>

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink>
              </BreadcrumbItem>
              {segments.slice(1).map((s, i, arr) => (
                <span key={s} className="flex items-center gap-1.5">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {i === arr.length - 1
                      ? <BreadcrumbPage className="capitalize">{s}</BreadcrumbPage>
                      : <BreadcrumbLink className="capitalize">{s}</BreadcrumbLink>}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="relative ml-auto hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-9 w-64 bg-muted/50 pl-9 text-sm" />
          </div>

          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-5" />
          </Button>

          <Avatar className="size-8 border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 page-enter">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
