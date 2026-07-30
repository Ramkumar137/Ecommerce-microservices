import { Link } from "@tanstack/react-router";

export function Footer() {
  const cols = [
    {
      title: "Shop",
      links: [
        { to: "/products", label: "All Products" },
        { to: "/products", label: "New Arrivals" },
        { to: "/products", label: "Best Sellers" },
        { to: "/products", label: "Sale" },
      ],
    },
    {
      title: "Support",
      links: [
        { to: "/orders", label: "Order Status" },
        { to: "/", label: "Shipping Info" },
        { to: "/", label: "Returns" },
        { to: "/", label: "Contact Us" },
      ],
    },
    {
      title: "Company",
      links: [
        { to: "/", label: "About" },
        { to: "/", label: "Careers" },
        { to: "/", label: "Press" },
        { to: "/", label: "Sustainability" },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/", label: "Privacy Policy" },
        { to: "/", label: "Terms of Service" },
        { to: "/", label: "Cookies" },
        { to: "/", label: "Accessibility" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-surface mt-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-foreground text-background text-[10px] font-bold">H</div>
            <span className="text-sm font-semibold tracking-tight">HeisenFlow</span>
          </Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HeisenFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
