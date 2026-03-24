import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ShoppingCart,
  User,
  ChevronDown,
  Search,
  LogOut,
  Settings,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/stores";
import { useWishlist } from "@/hooks";
import logo from "@/assets/images/CAMPUZONV2LT.png";
import { MobileMenu } from "./MobileMenu";
import MobileSearchOverlay from "../MobileSearchOverlay";
import { SearchHeader } from "./SearchHeader";
import { Icon } from "@iconify/react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isProductsPage = location.pathname === "/products";

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, isProductsPage]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const { user, isAuthenticated, logout } = useAuthStore();

  const { data: wishlist } = useWishlist();
  const wishlistCount = wishlist?.length || 0;

  const categories = [
    { label: "Dorm Essentials", value: "dorm-essentials" },
    { label: "Textbooks & Stationery", value: "textbooks" },
    { label: "Electronics & Gadgets", value: "electronics" },
    { label: "Fashion & Personal Care", value: "fashion" },
    { label: "Services & Campus Gigs", value: "services" },
    { label: "Tickets & Event Passes", value: "tickets" },
    { label: "Food & Groceries", value: "food" },
    { label: "Sports & Hobbies", value: "sports" },
    { label: "Lost & Found", value: "lost-found" },
  ];

  const filterTabs = [
    { label: "New Items", value: "new" },
    { label: "Used/Pre-owned", value: "used" },
    { label: "Campus Services", value: "services" },
    { label: "Donations/Free", value: "free" },
  ];

  const mainCategories = [
    { label: "Trending on Campus", href: "/products?filter=trending" },
    { label: "Daily Deals", href: "/products?filter=deals" },
    { label: "Campus Gigs", href: "/products?category=services" },
    { label: "Lost & Found", href: "/products?category=lost-found" },
    { label: "Sell Your Stuff", href: "/sell" },
  ];

  const UserMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors overflow-hidden border border-border"
      >
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.displayName || user.firstName}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-5 w-5" />
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
              <p className="font-medium text-sm">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
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
              to="/orders"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              My Orders
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
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      {/* Top Navigation Bar */}
      <div className="md:border-b border-border relative">
        <div
          className={`container w-full mx-auto ${isProductsPage ? "px-0 lg:px-6" : "px-3 lg:px-6"}`}
        >
          <div className="flex h-16 md:h-20 items-center justify-between py-3">
            {/* Left Column */}
            <div className="flex items-center gap-1 sm:gap-4 flex-1">
              {!isProductsPage ? (
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="flex items-center justify-center h-10 w-10 rounded hover:bg-muted transition-colors mr-2 sm:mr-4"
                  aria-label="Toggle menu"
                >
                  <Icon
                    icon="ri:menu-2-fill"
                    className="h-7 w-7 text-foreground"
                  />
                </button>
              ) : (
                <div className="flex w-full md:w-auto">
                  {/* Desktop hamburger on products page */}
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="hidden md:flex items-center justify-center h-10 w-10 rounded hover:bg-muted transition-colors mr-2 sm:mr-4"
                    aria-label="Toggle menu"
                  >
                    <Icon
                      icon="ri:menu-2-fill"
                      className="h-7 w-7 text-foreground"
                    />
                  </button>

                  {/* Mobile Search Header on Products Page */}
                  <div className="md:hidden h-[68px] flex-1 w-full flex items-center">
                    <SearchHeader
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={() =>
                        handleSearch({ preventDefault: () => {} } as any)
                      }
                      onBack={() => navigate("/")}
                      placeholder="Search campus..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Center: Logo — hidden on mobile always */}
            <Link
              to="/"
              className={cn(
                "hidden md:block absolute left-1/2 -translate-x-1/2 z-10 transition-all",
                isProductsPage && "md:hidden lg:block lg:opacity-100",
              )}
            >
              <img
                src={logo}
                alt="Campuzon"
                className="h-8 md:h-12 object-contain"
              />
            </Link>

            {/* Right Column: Actions */}
            <div
              className={cn(
                "flex items-center justify-end gap-1 sm:gap-3 md:flex-1",
                isProductsPage && "hidden md:flex",
              )}
            >
              {isProductsPage ? (
                <>
                  {/* Desktop search bar on products page */}
                  <form
                    onSubmit={handleSearch}
                    className="hidden md:flex items-center h-10 bg-muted px-4 rounded-full w-[240px] lg:w-[320px] transition-all mr-4"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="bg-transparent border-none outline-none text-sm text-gray-800 w-full"
                    />
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  </form>

                  {/* Desktop-only icons on products page */}
                  <div className="hidden md:flex items-center justify-end gap-1 sm:gap-3">
                    <Link
                      to="/notifications"
                      className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                    </Link>

                    <Link
                      to="/cart"
                      className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                      aria-label="Cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </Link>

                    {isAuthenticated && user ? (
                      <UserMenu />
                    ) : (
                      <Link
                        to="/login"
                        className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors border border-transparent"
                        aria-label="Account"
                      >
                        <User className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-end gap-1 sm:gap-3">
                  {/* Desktop Nav Links */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link
                      to="/become-seller"
                      className="text-[14px] font-medium text-gray-800 hover:text-primary transition-colors"
                    >
                      Sell
                    </Link>
                    <Link
                      to="/wishlist"
                      className="text-[14px] font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      Watchlist
                      {wishlistCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full flex items-center justify-center font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </nav>

                  {/* Mobile Search Icon - non-products pages only */}
                  <button
                    onClick={() => setShowMobileSearch(true)}
                    className="md:hidden relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  {/* Notifications: mobile only when logged in, desktop always */}
                  <Link
                    to="/notifications"
                    className={cn(
                      "relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors",
                      !isAuthenticated && "hidden md:inline-flex",
                    )}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Link>

                  {/* Cart — hidden on mobile */}
                  <Link
                    to="/cart"
                    className="hidden md:inline-flex relative h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* User — hidden on mobile */}
                  {isAuthenticated && user ? (
                    <div className="hidden md:block">
                      <UserMenu />
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors border border-transparent"
                      aria-label="Account"
                    >
                      <User className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - Desktop only, non-products pages */}
      {!isProductsPage && (
        <div className="hidden md:block bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 h-14 overflow-x-auto scrollbar-hide">
              {/* Category Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 h-10 px-4 bg-muted rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Browse Campus
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showCategoryDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCategoryDropdown(false)}
                    />
                    <div className="absolute left-0 top-12 z-50 w-56 rounded-lg border border-border bg-background shadow-lg py-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.value}
                          to={`/products?category=${cat.value}`}
                          onClick={() => setShowCategoryDropdown(false)}
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Links */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  to="/products?filter=trending"
                  className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Trending
                </Link>
                <Link
                  to="/products?category=services"
                  className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Gigs & Services
                </Link>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 min-w-0">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </form>

              {/* Filter Tabs */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                {filterTabs.map((tab) => (
                  <Link
                    key={tab.value}
                    to={`/products?filter=${tab.value}`}
                    className="h-10 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <MobileMenu
        logo={logo}
        isOpen={showMobileMenu}
        categories={categories}
        mainCategories={mainCategories}
        onClose={() => setShowMobileMenu(false)}
      />
      <MobileSearchOverlay
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </header>
  );
}