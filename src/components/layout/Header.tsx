import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useCartStore, useAuthStore } from "@/stores";
import logo from "@/assets/images/campuzon_logo.png";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Get cart items count
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get auth state
  const { user, isAuthenticated, logout } = useAuthStore();

  // Category filter tabs
  const filterTabs = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Children", value: "children" },
    { label: "Brand", value: "brand" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-header-bg borderb border-border">
      {/* Top Navigation Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img
                src={logo}
                alt="Campuzon"
                className="h-8 object-contain"
              />
            </Link>

            {/* Right: Navigation Links & Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop Links */}
              <nav className="hidden md:flex items-center gap-4 mr-2">
                <Link
                  to="/blog"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Blogs
                </Link>
                <Link
                  to="/faq"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  FAQs
                </Link>
              </nav>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.displayName || user.firstName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="font-medium text-sm">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings/security"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 h-14 overflow-x-auto scrollbar-hide">
            {/* Category Dropdown */}
            <div className="shrink-0">
              <button className="flex items-center gap-2 h-10 px-4 bg-muted rounded-full text-sm font-medium hover:bg-muted/80 transition-colors">
                Clothing
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Links */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link
                to="/products?filter=new"
                className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/products?filter=sale"
                className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Sale
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {filterTabs.map((tab) => (
                <Link
                  key={tab.value}
                  to={`/products?category=${tab.value}`}
                  className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-border">
              <img
                src="/campuzon_logo.png"
                alt="Campuzon"
                className="h-8 object-contain"
              />
            </div>
            <nav className="p-4 space-y-2">
              <Link
                to="/products?filter=new"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/products?filter=sale"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Sale
              </Link>
              <hr className="my-4 border-border" />
              {filterTabs.map((tab) => (
                <Link
                  key={tab.value}
                  to={`/products?category=${tab.value}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {tab.label}
                </Link>
              ))}
              <hr className="my-4 border-border" />
              <Link
                to="/blog"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/faq"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                FAQs
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
