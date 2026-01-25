import { Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

interface TopUtilityBarProps {
  isAuthenticated: boolean;
  user: any;
  cartCount: number;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  onLogout: () => void;
}

export function TopUtilityBar({
  isAuthenticated,
  user,
  cartCount,
  showUserMenu,
  onToggleUserMenu,
  onLogout,
}: TopUtilityBarProps) {
  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-10 items-center justify-between text-xs">
          {/* Left: Utility Links */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && user && (
                <span className="text-foreground font-medium">
                  Hi, {user.firstName}!
                </span>
              )}
            </div>
            <Link
              to="/deals"
              className="text-foreground hover:text-primary transition-colors"
            >
              Daily Deals
            </Link>
            <Link
              to="/stores"
              className="hidden sm:inline text-foreground hover:text-primary transition-colors"
            >
              Campus Stores
            </Link>
            <Link
              to="/help"
              className="hidden md:inline text-foreground hover:text-primary transition-colors"
            >
              Help & Contact
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative text-foreground hover:text-primary transition-colors"
            >
              Notifications
            </Link>
            <Link
              to="/wishlist"
              className="hidden sm:inline text-foreground hover:text-primary transition-colors"
            >
              Watchlist
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={onToggleUserMenu}
                  className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                >
                  My Account
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={onToggleUserMenu}
                    />
                    <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
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
                        onClick={onToggleUserMenu}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={onToggleUserMenu}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        to="/settings/security"
                        onClick={onToggleUserMenu}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          onLogout();
                          onToggleUserMenu();
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
                className="text-foreground hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-1 text-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
