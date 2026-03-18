import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "react-hot-toast";

const BOTTOM_NAV_PATHS = new Set([
  "/",
  "/products",
  "/wishlist",
  "/cart",
  "/profile",
]);

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function Layout() {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const showBottomNav = BOTTOM_NAV_PATHS.has(currentPath);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${showBottomNav ? "pb-16 md:pb-0" : ""}`}>
        <Outlet />
      </main>
      {showBottomNav ? <MobileBottomNav /> : null}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "white",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-primary)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
}
