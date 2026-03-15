import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "react-hot-toast";

export function StoreLayout() {
  return (
    <div className="min-h-screen container-small mx-auto flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-background)",
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
