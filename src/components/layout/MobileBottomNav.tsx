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
  MessageCircle,
  Settings,
  BarChart3,
  PackageOpen,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { useCartStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import { useNavigationContext } from "@/hooks/useNavigationContext";

// would place the unread messages here
const unreadMessagesCount = 0; 

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
    path: "/",
    label: "Shop",
    icon: Home,
    requiresAuth: true,
    exactMatch: true,
  },
  { 
    path: "/orders", 
    label: "Orders", 
    icon: Package, 
    requiresAuth: true 
  },
  {
    path: "/messages",
    label: "Messages",
    icon: MessageCircle,
    requiresAuth: true,
  },
  { path: "/cart", label: "Cart", icon: ShoppingCart, requiresAuth: true },
  { path: "/profile", label: "Profile", icon: User, requiresAuth: true },
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
    path: "/seller/messages",
    label: "Messages",
    icon: MessageCircle,
    requiresAuth: true,
  },
  {
    path: "/seller/orders",
    label: "Orders",
    icon: PackageOpen,
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
          const isMessage = item.path === "/messages" || item.path === "/seller/messages";
          const msgCount = isMessage ? unreadMessagesCount : 0;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              <div className="relative">
                {isMessage? (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white shadow-lg ring-2 ring-background">
                    <Icon className="h-8 w-8" />
                    {msgCount > 0 && <Badge count={msgCount} />}
                  </div>
                ) : isProfile && isAuthenticated && user?.profileImage ? (
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
// to display message count
function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground ring-2 ring-background animate-in zoom-in duration-200">
      {count > 99 ? "99+" : count}
    </span>
  );
}