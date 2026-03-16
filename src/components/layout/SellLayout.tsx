import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  MessageSquare,
  Bell,
  LogOut,
  ChevronDown,
  Store,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores";
import { useMyStore } from "@/hooks";
import logo from "@/assets/images/CAMPUZONV2LT.png";

const NAV_LINKS = [
  { to: "/seller/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { to: "/seller/messages", label: "Messages", icon: MessageSquare },
  { to: "/seller/settings", label: "Settings", icon: Settings },
];

export function SellLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: store } = useMyStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Seller Header */}
      <header className="sticky top-0 z-40 w-full bg-white borderb border-gray-100 shadowsm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Back link + Logo + Store pill */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Store</span>
              </Link>

              <div className="h-5 w-px bg-gray-200" />

              <Link to="/seller/dashboard" className="shrink-0">
                <img src={logo} alt="Campuzon" className="h-7 w-auto" />
              </Link>

              {store?.name && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  <Store className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-[160px] truncate">{store.name}</span>
                </div>
              )}
            </div>

            {/* Right: Notifications + User avatar */}
            <div className="flex items-center gap-1.5">
              {/* Notification bell */}
              <button
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* User menu */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-gray-100 transition-colors"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.displayName ?? user.firstName}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-800">
                    {user?.firstName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5 z-50">
                    {/* User info */}
                    <div className="flex items-center gap-3 border-b border-gray-100 px-4 pb-3 pt-2">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.displayName ?? user.firstName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {user?.displayName ??
                            `${user?.firstName} ${user?.lastName}`}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="mt-1.5 px-2 space-y-0.5">
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 text-gray-400" />
                        Back to Store
                      </Link>
                      <Link
                        to="/seller/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    <div className="mt-1.5 border-t border-gray-100 pt-1.5 px-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="border-t border-gray-100">
          <div className="container mx-auto px-4">
            <nav
              className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
              aria-label="Seller navigation"
            >
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
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
