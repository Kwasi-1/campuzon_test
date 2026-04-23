import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
  MessageCircle,
} from "lucide-react";
import { useAuthStore, useCartStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";

export function MobileBottomNav() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const cartCount = useCartStore((state) => state.items.length);
  
  // Replace with actual unread logic from your chat store
  const unreadMessagesCount = 3; 

  const navItems = [
    { path: "/", icon: Home, requiresAuth: false },
    { path: "/products", icon: LayoutGrid, requiresAuth: false },
    { path: "/messages", icon: MessageCircle, requiresAuth: true, isMessage: true },
    { path: "/cart", icon: ShoppingCart, requiresAuth: false, isCart: true },
    { path: "/profile", icon: User, requiresAuth: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const badgeCount = item.isCart ? cartCount : item.isMessage ? unreadMessagesCount : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.requiresAuth && !isAuthenticated) {
                  e.preventDefault();
                  openAuthPrompt();
                }
              }}
              className="relative flex items-center justify-center w-full h-full text-muted-foreground/70"
            >
              <div className="relative">
                {item.isMessage ? (
                  /* Center Message Button (FAB Style) */
                  <div className="h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90 text-white shadow-lg ring-2 ring-background">
                    <Icon className="h-5 w-5" />
                    {badgeCount > 0 && <Badge count={badgeCount} />}
                  </div>
                ) : (
                  /* Standard Nav Icons */
                  <div className="p-2">
                    <Icon className="h-6 w-6 stroke-[2px]" />
                    {badgeCount > 0 && <Badge count={badgeCount} />}
                  </div>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Reusable Notification Badge
 */
function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}