import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X, Bell, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useMounted } from "@/hooks/useMounted";
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

import { NotificationPopover } from "@/components/common/NotificationPopover";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
];

export function Navbar() {
  const mounted = useMounted();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAuth = mounted && isAuthenticated;
  const isAdm = mounted && isAdmin;
  const cartCount = mounted ? count : 0;
  const totalWishlist = mounted ? wishlistCount : 0;

  // Hide Orders link in main Navbar if user is ADMIN
  const navigation = isAuth && !isAdm
    ? [...baseNav, { to: "/orders", label: "Orders" }]
    : baseNav;

  const initials = isAuth ? (isAdm ? "ADMIN" : getUserInitials(user)) : "";
  const fullName = isAuth ? [user?.first_name, user?.last_name].filter(Boolean).join(" ") : "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate({ to: "/products", search: { q: searchQuery.trim() } as any });
    setSearchQuery("");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:px-10">

        {/* Mobile menu */}
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

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="border-b px-4 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  className="h-9 pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <nav className="flex flex-col p-3">
              {navigation.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {n.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              {isAdm ? (
                <>
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/settings" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    Settings
                  </Link>
                </>
              ) : (
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  Profile
                </Link>
              )}
              {!isAdm && (
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-foreground text-background text-xs font-bold transition-transform hover:scale-105">H</div>
          <span className="text-[15px] font-semibold tracking-tight">HeisenFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navigation.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Desktop search */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              className="h-9 w-64 bg-muted/50 pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notification Symbol between Search and Profile Icon */}
          {isAuth && <NotificationPopover />}

          {/* Wishlist */}
          {!isAdm && (
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist" className="relative">
              <Link to="/wishlist">
                <Heart className="size-5" />
                {totalWishlist > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                    {totalWishlist}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* Cart */}
          {!isAdm && (
            <Button asChild variant="ghost" size="icon" aria-label="Cart" className="relative">
              <Link to="/cart">
                <ShoppingBag className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isAuth ? (
                <Button variant="ghost" className="relative h-9 px-2.5 rounded-full" aria-label="User menu">
                  {isAdm ? (
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold tracking-wider text-primary border border-primary/20">
                      ADMIN
                    </span>
                  ) : (
                    <Avatar className="size-8 border bg-muted">
                      <AvatarFallback className="bg-primary font-semibold text-xs text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </Button>
              ) : (
                <Button variant="ghost" size="icon" aria-label="Sign in">
                  <User className="size-5" />
                </Button>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              {!isAuth ? (
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
                        {fullName || user?.username || (isAdm ? "Admin User" : "User Account")}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "No email available"}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {isAdm ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/settings">Settings</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders">My Orders</Link>
                      </DropdownMenuItem>
                    </>
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
