import { Link } from "@tanstack/react-router";

export function Footer() {
  const cols = [
    {
      title: "Shop",
      links: [
        { to: "/products", label: "All products" },
        { to: "/products", label: "New arrivals" },
        { to: "/products", label: "Best sellers" },
        { to: "/products", label: "Sale" },
      ],
    },
    {
      title: "Support",
      links: [
        { to: "/orders", label: "Order status" },
        { to: "/", label: "Shipping" },
        { to: "/", label: "Returns" },
        { to: "/", label: "Contact" },
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
        { to: "/", label: "Privacy" },
        { to: "/", label: "Terms" },
        { to: "/", label: "Cookies" },
        { to: "/", label: "Accessibility" },
      ],
    },
  ];
  
}
