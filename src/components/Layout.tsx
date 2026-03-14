import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  MapPin,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categories } from "@/data/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import MobileSearchOverlay from "./MobileSearchOverlay";
import BottomNavigation from "./BottomNavigation";
import AppLogo from "./shared/AppLogo";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const cartItemsCount = getTotalItems();

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAuthenticatedLink = (path: string) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    navigate(path);
  };

  // Use categories from mock data to ensure consistency
  const groceryCategories = categories.map((cat: any) => cat.name);

  return (
    <div className="min-h-screen">
      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      {/* Top Info Bar */}
      <div className="bg-black text-white py-2 text-sm hidden mdblock">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Accra</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="ph:envelope" className="w-4 h-4" />
              <span>support@tobra.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="ph:phone" className="w-4 h-4" />
              <span>+233 (0) 240-502-928</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/account"
                className="hover:text-gray-600 bg-white text-black -my-2 p-2 px-3 font-semibold tracking-wide"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/signup"
                className="hover:text-gray-600 bg-white text-black -my-2 p-2 px-3 font-semibold tracking-wide"
              >
                Create Account
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <span>GHS</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span>ENGLISH</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <AppLogo />

            {/* Category Dropdown & Search - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                {/* Category Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-r-none px-4 py-6 bg-gray-50 hover:bg-gray-100 border-gray-300 border-r"
                    >
                      All Categories
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>All Categories</DropdownMenuItem>
                    {groceryCategories.map((category) => (
                      <DropdownMenuItem key={category}>
                        <Link to={`/categories?category=${encodeURIComponent(category)}`}>
                          {category}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search groceries, fresh produce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-l-0 border-r-0 rounded-l-none rounded-r-none border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="px-6 py-6 bg-red-500 hover:bg-red-600 rounded-l-none"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search - Hidden on Desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="w-7 h-7" />
              </Button>

              {/* Mobile Menu - Desktop Hidden */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-7 h-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  {/* <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Navigate through our grocery categories
                    </SheetDescription>
                  </SheetHeader> */}

                  <div className="mt-6 space-y-6">
                    {/* Account Links */}
                    {!user ? (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-3">
                          Account
                        </h3>
                        <div className="space-y-2">
                          <Link
                            to="/account"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            My Account
                          </Link>
                          <Link
                            to="/orders"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Order History
                          </Link>
                          <Link
                            to="/wishlist"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Shopping List
                          </Link>
                          <Link
                            to="/cart"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cart
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block py-2 text-sm text-red-600 hover:text-red-700 text-left"
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-3">
                          Account
                        </h3>
                        <div className="space-y-2">
                          <Link
                            to="/login"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/signup"
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Icons - Hidden on Mobile */}
              <div className="hidden md:flex items-center space-x-4">
                {/* User Account */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/account">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders">Order History</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wishlist">Shopping List</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    </Button>
                  </Link>
                )}

                {/* Wishlist */}
                <Button
                  variant="ghost"
                  onClick={() => handleAuthenticatedLink("/wishlist")}
                >
                  <Icon icon="ph:heart" className="w-6 h-6" />
                </Button>

                {/* Cart */}
                <Link to="/cart">
                  <Button variant="ghost" className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Notifications */}
                <Button variant="ghost">
                  <div className="relative">
                    <Bell className="w-6 h-6" />
                    <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500 rounded-full">
                      <span className="sr-only">New notifications</span>
                    </Badge>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search groceries, fresh produce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Navigation Categories */}
        <nav className="border-t border-gray-200 hidden lg:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
              <Link
                to="/"
                className={`py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === "/"
                    ? "text-red-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                HOME
              </Link>
              {groceryCategories.map((category) => (
                <Link
                  key={category}
                  to={`/categories?category=${encodeURIComponent(category)}`}
                  className="py-4 px-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  {category.toUpperCase()}
                </Link>
              ))}
              <Link
                to="/deals"
                className="py-4 px-2 text-sm font-medium text-red-500 hover:text-red-600 border-b-2 border-transparent hover:border-red-500 transition-colors whitespace-nowrap"
              >
                HOT OFFERS
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Simplified for grocery focus */}
      <footer className="bg-black text-white mt-8">
        <div className="container mx-auto px-4 lg:px-6 py-12 md:section-padding pb-8 pt-16 md:pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:pb-8">
            {/* Brand */}
            <div>
              <AppLogo isLight={true} className="mb-4" />

              <p className="text-gray-300 text-sm mb-4">
                Ghana's premier online grocery marketplace. Fresh produce,
                quality products, delivered fast.
              </p>
              <div className="flex space-x-3">
                <Icon
                  icon="mdi:facebook"
                  className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer"
                />
                <Icon
                  icon="mdi:instagram"
                  className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer"
                />
                <Icon
                  icon="mdi:twitter"
                  className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer"
                />
              </div>
            </div>

            {/* My Account */}
            <div>
              <h3 className="font-[500] font-display mb-4 text-lg text-white">
                My Account
              </h3>
              <ul className="space-y-2.5 text-gray-300 font-[300] tracking-wide text-sm">
                <li>
                  <button
                    onClick={() => handleAuthenticatedLink("/account")}
                    className="hover:text-white text-left"
                  >
                    My Account
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleAuthenticatedLink("/orders")}
                    className="hover:text-white text-left"
                  >
                    Order History
                  </button>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white">
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => handleAuthenticatedLink("/wishlist")}
                    className="hover:text-white text-left"
                  >
                    Wishlist
                  </button>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h3 className="font-[500] font-display mb-4 text-lg text-white">
                Help & Support
              </h3>
              <ul className="space-y-2.5 text-gray-300 font-[300] tracking-wide text-sm">
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="hover:text-white">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="font-[500] font-display text-lg mb-4 text-white">
                Company
              </h3>
              <ul className="space-y-2.5 text-gray-300 font-[300] tracking-wide text-sm">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="hover:text-white">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/stores" className="hover:text-white">
                    Our Stores
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-white">
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>

            {/* Business & Admin Portal */}
            <div>
              <h3 className="font-[500] text-lg mb-4 text-white">
                Get Our App
              </h3>

              <div className="space-y-3">
                <Link to="#" className="block">
                  <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center space-x-3 transition-colors">
                    <Icon icon="mdi:apple" className="w-6 h-6" />
                    <div>
                      <div className="text-xs text-gray-400">
                        Download on the
                      </div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </Link>
                <Link to="#" className="block">
                  <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center space-x-3 transition-colors">
                    <Icon icon="logos:google-play-icon" className="w-6 h-6" />
                    <div>
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Tobra.com. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to be signed in to access this page. Please sign in to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link to="/login" className="flex-1">
              <Button className="w-full bg-red-500 hover:bg-red-600">
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
