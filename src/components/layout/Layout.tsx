import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "react-hot-toast";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import { useNavigationContext } from "@/hooks/useNavigationContext";

export function Layout() {
  const { showBottomNav } = useNavigationContext();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${showBottomNav ? "pb-16 md:pb-0" : ""}`}>
        <Outlet />
      </main>
      {showBottomNav ? <MobileBottomNav /> : null}
      <AuthRequiredModal />
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
