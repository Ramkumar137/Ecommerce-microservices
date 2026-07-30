import { Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
    </div>
  );
}

export default SiteLayout;
