import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/user";
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
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = isAuthenticated
    ? [...baseNav, { to: "/orders", label: "Orders" }]
    : baseNav;

  const initials = getUserInitials(user);
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-base font-semibold tracking-tight">
                HeisenFlow
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
          <span className="text-[15px] font-semibold tracking-tight">HeisenFlow</span>
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

          {!isAdmin && (
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
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isAuthenticated ? (
                <Button variant="ghost" className="relative size-9 rounded-full p-0" aria-label="User menu">
                  <Avatar className="size-9 border bg-muted">
                    <AvatarFallback className="bg-primary font-semibold text-xs text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" aria-label="Sign in">
                  <User className="size-5" />
                </Button>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              {!isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/register">Register</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {fullName || user?.username || "User Account"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "No email available"}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>

                  {(user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "ADMINISTRATOR") && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive focus:text-destructive"
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
