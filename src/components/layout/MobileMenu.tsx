import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "@/hooks/useNavigationContext";
import { useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";

interface Category {
  label: string;
  value: string;
}

interface MainCategory {
  label: string;
  href: string;
}

interface MobileMenuProps {
  logo: string;
  isOpen: boolean;
  categories: Category[];
  mainCategories: MainCategory[];
  onClose: () => void;
}

export function MobileMenu({
  logo,
  isOpen,
  categories,
  mainCategories,
  onClose,
}: MobileMenuProps) {
  const navigate = useNavigate();
  const { context } = useNavigationContext();
  const { isAuthenticated, user, logout, userMode, switchUserMode } =
    useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();

  if (!isOpen) return null;

  // Filter tabs for mobile
  const filterTabs = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Children", value: "children" },
    { label: "Brand", value: "brand" },
  ];

  const canAccessSeller = Boolean(user?.isOwner || user?.store);
  const isPublicContext = context === "public";
  const isClientContext = context === "client";
  const isSellerContext = context === "seller";

  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      openAuthPrompt(path, "Sign in to access this feature.");
      onClose();
      return;
    }

    navigate(path);
    onClose();
  };

  const handleSwitchMode = (mode: "buyer" | "seller") => {
    switchUserMode(mode);
    navigate(mode === "seller" ? "/seller/dashboard" : "/profile");
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm lg:max-w-md bg-background z-[999] shadow-xl overflow-y-auto scrollbar-hide">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <Link to="/" onClick={onClose}>
            <img
              src={logo}
              alt="Campuzon"
              className="h-8 md:h-10 object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 !tracking-tight">
          {isPublicContext && (
            <>
              {mainCategories.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.href}
                  onClick={onClose}
                  className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  {cat.label}
                </Link>
              ))}

              <hr className="my-3 border-border" />

              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Filter by
              </p>
              {filterTabs.map((tab) => (
                <Link
                  key={tab.value}
                  to={`/products?filter=${tab.value}`}
                  onClick={onClose}
                  className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  {tab.label}
                </Link>
              ))}

              <hr className="my-3 border-border" />

              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  to={`/products?category=${cat.value}`}
                  onClick={onClose}
                  className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  {cat.label}
                </Link>
              ))}

              <hr className="my-3 border-border" />

              <button
                onClick={() => handleProtectedNavigation("/wishlist")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Wishlist
              </button>
              <Link
                to="/faqs"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                FAQs
              </Link>
              <Link
                to="/stores"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Campus Stores
              </Link>
            </>
          )}

          {isClientContext && (
            <>
              <button
                onClick={() => handleProtectedNavigation("/profile")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => handleProtectedNavigation("/orders")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Orders
              </button>
              <button
                onClick={() => handleProtectedNavigation("/wishlist")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Wishlist
              </button>
              <button
                onClick={() => handleProtectedNavigation("/addresses")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Saved Addresses
              </button>
              <button
                onClick={() => handleProtectedNavigation("/payments")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Payment Methods
              </button>
              <button
                onClick={() => handleProtectedNavigation("/notifications")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Notifications
              </button>
              <button
                onClick={() => handleProtectedNavigation("/settings")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Settings
              </button>

              {canAccessSeller && (
                <>
                  <hr className="my-3 border-border" />
                  <button
                    onClick={() => handleSwitchMode("seller")}
                    className="block w-full text-left px-4 py-2.5 rounded-sm border border-border text-primary hover:bg-primary/10 transition-colors"
                  >
                    Switch to Seller Mode
                  </button>
                </>
              )}

              <hr className="my-3 border-border" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {isSellerContext && (
            <>
              <Link
                to="/seller/dashboard"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/seller/products"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Products
              </Link>
              <Link
                to="/seller/orders"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Orders
              </Link>
              <Link
                to="/seller/messages"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Messages
              </Link>
              <Link
                to="/seller/settings"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                Store Settings
              </Link>

              <hr className="my-3 border-border" />
              <button
                onClick={() => handleSwitchMode("buyer")}
                className="block w-full text-left px-4 py-2.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                Switch to Buyer Mode
              </button>
              <button
                onClick={handleLogout}
                className="mt-1 block w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!isPublicContext && !isClientContext && !isSellerContext && (
            <>
              <button
                onClick={() => handleProtectedNavigation("/profile")}
                className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                My Profile
              </button>
              {canAccessSeller && userMode === "seller" && (
                <button
                  onClick={() => handleProtectedNavigation("/seller/dashboard")}
                  className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  Seller Dashboard
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </>
  );
}
