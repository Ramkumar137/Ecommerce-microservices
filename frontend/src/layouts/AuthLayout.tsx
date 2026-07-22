import { Outlet, Link } from "@tanstack/react-router";

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-foreground text-background text-xs font-bold">N</div>
          <span className="text-[15px] font-semibold tracking-tight">HeisenHub</span>
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <Outlet />
        </div>
        {/* <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HeisenHub, Inc.</p> */}
      </div>
      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <img src="https://picsum.photos/seed/nl-auth/1400/1800" alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        {/* <div className="absolute bottom-10 left-10 right-10 rounded-xl border border-white/20 bg-background/85 p-6 backdrop-blur">
          <p className="text-sm font-medium">"Northline has been my go-to for thoughtful, dependable gear. The shopping experience feels genuinely considered."</p>
          <p className="mt-3 text-xs text-muted-foreground">— Priya S., product designer</p>
        </div> */}
      </div>
    </div>
  );
}

export default AuthLayout;
