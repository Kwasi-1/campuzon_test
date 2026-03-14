import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

/**
 * Sell Route Layout
 * Completely isolated layout for /sell routes with unique header
 * Used for seller dashboard and related pages
 */
export function SellLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Seller Header */}
      <header className="sticky top-0 z-40 w-full bg-header-bg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Back to Store */}
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>

            {/* Seller Dashboard Title */}
            <h1 className="text-lg font-semibold">Seller Dashboard</h1>

            {/* Seller Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/seller/settings"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Seller Navigation */}
        <div className="border-t border-border">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Link
                to="/seller/dashboard"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/seller/products"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors whitespace-nowrap"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link
                to="/seller/orders"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4" />
                Orders
              </Link>
              <Link
                to="/seller/messages"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

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
