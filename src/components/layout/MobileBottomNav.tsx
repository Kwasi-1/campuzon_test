import type { ComponentType, MouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
  Heart,
  Flame,
  Package,
  MessageSquare,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { useCartStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import { useNavigationContext } from "@/hooks/useNavigationContext";

type NavItem = {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  exactMatch?: boolean;
};

const publicTabs: NavItem[] = [
  {
    path: "/",
    label: "Shop",
    icon: Home,
    requiresAuth: false,
    exactMatch: true,
  },
  {
    path: "/products",
    label: "Category",
    icon: LayoutGrid,
    requiresAuth: false,
  },
  {
    path: "/products?sort=hot",
    label: "Deals",
    icon: Flame,
    requiresAuth: false,
  },
  { path: "/cart", label: "Cart", icon: ShoppingCart, requiresAuth: false },
  { path: "/profile", label: "Profile", icon: User, requiresAuth: true },
];

const clientTabs: NavItem[] = [
  {
    path: "/profile",
    label: "Profile",
    icon: User,
    requiresAuth: true,
    exactMatch: true,
  },
  { path: "/orders", label: "Orders", icon: ShoppingCart, requiresAuth: true },
  {
    path: "/messages",
    label: "Messages",
    icon: MessageSquare,
    requiresAuth: true,
  },
  { path: "/wishlist", label: "Wishlist", icon: Heart, requiresAuth: true },
  { path: "/cart", label: "Cart", icon: ShoppingCart, requiresAuth: true },
];

const sellerTabs: NavItem[] = [
  {
    path: "/seller/dashboard",
    label: "Dashboard",
    icon: BarChart3,
    requiresAuth: true,
  },
  {
    path: "/seller/products",
    label: "Products",
    icon: Package,
    requiresAuth: true,
  },
  {
    path: "/seller/orders",
    label: "Orders",
    icon: ShoppingCart,
    requiresAuth: true,
  },
  {
    path: "/seller/messages",
    label: "Messages",
    icon: MessageSquare,
    requiresAuth: true,
  },
  {
    path: "/seller/settings",
    label: "Settings",
    icon: Settings,
    requiresAuth: true,
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { context, showBottomNav } = useNavigationContext();
  const { isAuthenticated, user } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (!showBottomNav) {
    return null;
  }

  const navItems =
    context === "seller"
      ? sellerTabs
      : context === "client"
        ? clientTabs
        : publicTabs;

  const handleNavClick = (e: MouseEvent, item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openAuthPrompt(item.path, "Sign in to access this feature.");
    }
  };

  const isTabActive = (item: NavItem) => {
    if (item.exactMatch) {
      return location.pathname === item.path.split("?")[0];
    }
    if (item.path.startsWith("/products?")) {
      const query = item.path.split("?")[1] || "";
      return (
        location.pathname === "/products" && location.search.includes(query)
      );
    }
    const pathSegment = item.path.split("?")[0];
    return (
      location.pathname === pathSegment ||
      location.pathname.startsWith(`${pathSegment}/`)
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background backdrop-blur-sm border-t border-border safe-area-pb">
      <div className="flex items-stretch h-[58px]">
        {navItems.map((item) => {
          const isActive = isTabActive(item);
          const Icon = item.icon;
          const isCart = item.path === "/cart";
          const isProfile = item.path === "/profile";

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              <div className="relative">
                {isProfile && isAuthenticated && user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.displayName || user.firstName}
                    className={`h-5 w-5 rounded-full object-cover ${
                      isActive
                        ? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                        : ""
                    }`}
                  />
                ) : (
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      isActive
                        ? "text-foreground stroke-[2.5px]"
                        : "text-muted-foreground/70"
                    }`}
                  />
                )}

                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>

              {/* <span
                className={`text-[10px] leading-tight font-medium transition-colors ${
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span> */}

              {/* {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              )} */}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
