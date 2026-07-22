import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = isAuthenticated
  ? [
      ...baseNav,
      { to: "/orders", label: "Orders" },
    ]
  : baseNav;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-base font-semibold tracking-tight">
                HeisenHub
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col p-3">
              {navigation.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                Profile
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                Admin
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-foreground text-background text-xs font-bold">H</div>
          <span className="text-[15px] font-semibold tracking-tight">HeisenHub</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navigation.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              className="h-9 w-64 bg-muted/50 pl-9 text-sm"
            />
          </div>

          <Button asChild variant="ghost" size="icon" aria-label="Cart" className="relative">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              >
                <User className="size-5" />

                {isAuthenticated && (
                  <span className="hidden md:block text-sm">
                    {user?.email}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">

              {!isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/login">
                      Sign In
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/auth/register">
                      Register
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>
                    {user?.email}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/orders">
                      Orders
                    </Link>
                  </DropdownMenuItem>

                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
