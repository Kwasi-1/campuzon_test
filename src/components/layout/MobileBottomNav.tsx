import type { MouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/stores";
import { useCartStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import { useNavigationContext } from "@/hooks/useNavigationContext";

// would place the unread messages here
const unreadMessagesCount = 0; 

type NavItem = {
  path: string;
  label: string;
  icon: string;
  requiresAuth: boolean;
  exactMatch?: boolean;
};

const publicTabs: NavItem[] = [
  {
    path: "/",
    label: "Shop",
    icon: "solar:home-angle-linear",
    requiresAuth: false,
    exactMatch: true,
  },
  {
    path: "/products",
    label: "Category",
    icon: "solar:widget-4-linear",
    requiresAuth: false,
  },
  {
    path: "/products?sort=hot",
    label: "Deals",
    icon: "solar:fire-linear",
    requiresAuth: false,
  },
  { path: "/cart", label: "Cart", icon: "solar:cart-3-linear", requiresAuth: false },
  { path: "/profile", label: "Profile", icon: "solar:user-linear", requiresAuth: true },
];

const clientTabs: NavItem[] = [
  {
    path: "/profile",
    label: "Profile",
    icon: "solar:user-linear",
    requiresAuth: true,
    exactMatch: true,
  },
  { path: "/orders", label: "Orders", icon: "solar:clipboard-list-linear", requiresAuth: true },
  {
    path: "/messages",
    label: "Messages",
    icon: "solar:chat-round-dots-linear",
    requiresAuth: true,
  },
  { path: "/wishlist", label: "Wishlist", icon: "solar:heart-linear", requiresAuth: true },
  { path: "/cart", label: "Cart", icon: "solar:cart-3-linear", requiresAuth: true },
];

const sellerTabs: NavItem[] = [
  {
    path: "/seller/dashboard",
    label: "Dashboard",
    icon: "solar:chart-square-linear",
    requiresAuth: true,
  },
  {
    path: "/seller/products",
    label: "Products",
    icon: "solar:box-linear",
    requiresAuth: true,
  },
  {
    path: "/seller/orders",
    label: "Orders",
    icon: "solar:clipboard-list-linear",
    requiresAuth: true,
  },
  {
    path: "/seller/messages",
    label: "Messages",
    icon: "solar:chat-round-dots-linear",
    requiresAuth: true,
  },
  {
    path: "/seller/settings",
    label: "Settings",
    icon: "solar:settings-linear",
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-3 safe-area-pb pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-14 w-full max-w-md items-center justify-between gap-1 rounded-full border border-primary/80 bg-primary p-1.5 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = isTabActive(item);
          const isCart = item.path === "/cart";
          const isProfile = item.path === "/profile";
          const isMessage = item.path === "/messages" || item.path === "/seller/messages";
          const msgCount = isMessage ? unreadMessagesCount : 0;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`relative flex h-11 items-center justify-center rounded-full px-3 transition-all duration-200 ${
                isActive
                  ? "min-w-[92px] bg-background text-foreground shadow-sm"
                  : "min-w-[44px] text-primary-foreground/70 hover:bg-primary/80"
              }`}
            >
              <div className="relative flex items-center justify-center">
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
                    icon={item.icon}
                    className={`h-5 w-5 transition-all ${
                      isActive
                        ? "text-foreground"
                        : "text-primary-foreground/70"
                    }`}
                  />
                )}

                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>

              {isActive && (
                <span className="ml-2 truncate text-xs font-semibold leading-none text-foreground">
                  {item.label}
                </span>
              )}
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