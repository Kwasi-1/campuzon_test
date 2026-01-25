import { useState } from "react";
import { useCartStore, useAuthStore } from "@/stores";
import logo from "@/assets/images/campuzon_logo.png";
import { TopUtilityBar } from "./TopUtilityBar";
import { MainSearchBar } from "./MainSearchBar";
import { CategoryNavigation } from "./CategoryNavigation";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Get cart items count
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get auth state
  const { user, isAuthenticated, logout } = useAuthStore();

  // Campus marketplace categories
  const categories = [
    { label: "Electronics", value: "electronics" },
    { label: "Books & Stationery", value: "books" },
    { label: "Fashion & Clothing", value: "fashion" },
    { label: "Furniture", value: "furniture" },
    { label: "Sports & Fitness", value: "sports" },
    { label: "Beauty & Personal Care", value: "beauty" },
    { label: "Food & Groceries", value: "food" },
    { label: "Services", value: "services" },
    { label: "Accessories", value: "accessories" },
  ];

  // Main category navigation
  const mainCategories = [
    { label: "Trending", href: "/products?filter=trending" },
    { label: "Saved", href: "/wishlist" },
    { label: "Electronics", href: "/products?category=electronics" },
    { label: "Books", href: "/products?category=books" },
    { label: "Fashion", href: "/products?category=fashion" },
    { label: "Furniture", href: "/products?category=furniture" },
    { label: "Sports", href: "/products?category=sports" },
    { label: "Beauty", href: "/products?category=beauty" },
    { label: "Food", href: "/products?category=food" },
    { label: "Deals", href: "/products?filter=deals" },
    { label: "Sell", href: "/sell" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-header-bg">
      {/* Top Utility Bar */}
      <TopUtilityBar
        isAuthenticated={isAuthenticated}
        user={user}
        cartCount={cartCount}
        showUserMenu={showUserMenu}
        onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
        onLogout={logout}
      />

      {/* Main Search Bar */}
      <MainSearchBar
        logo={logo}
        categories={categories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        showCategoryMenu={showCategoryMenu}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onToggleCategoryMenu={() => setShowCategoryMenu(!showCategoryMenu)}
        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
      />

      {/* Category Navigation */}
      <CategoryNavigation categories={mainCategories} />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        logo={logo}
        isOpen={showMobileMenu}
        categories={categories}
        mainCategories={mainCategories}
        onClose={() => setShowMobileMenu(false)}
      />
    </header>
  );
}
