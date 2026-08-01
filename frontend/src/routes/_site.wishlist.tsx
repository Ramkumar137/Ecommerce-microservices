import { createFileRoute } from "@tanstack/react-router";
import WishlistPage from "@/pages/customer/Wishlist";

export const Route = createFileRoute("/_site/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — HeisenFlow" },
      { name: "description", content: "View and manage your saved wishlist products." },
    ],
  }),
  component: WishlistPage,
});
