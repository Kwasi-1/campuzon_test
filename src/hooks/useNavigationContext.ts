import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export type NavigationContext = "public" | "client" | "seller" | "admin" | "auth";

interface NavigationContextState {
  context: NavigationContext;
  pathname: string;
  isDetailView: boolean;
  showBottomNav: boolean;
}

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/verify-2fa",
  "/verify-account",
  "/become-seller",
]);

const CLIENT_BASE_PATHS = [
  "/profile",
  "/orders",
  "/messages",
  "/wishlist",
  "/addresses",
  "/payments",
  "/notifications",
  "/settings",
  "/checkout",
  "/cart",
] as const;

const PUBLIC_BASE_PATHS = [
  "/",
  "/products",
  "/categories",
  "/deals",
  "/product",
  "/stores",
  "/contact",
  "/faqs",
  "/terms",
  "/privacy",
  "/about",
] as const;

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function matchesBasePath(pathname: string, basePath: string): boolean {
  if (basePath === "/") return pathname === "/";
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function detectContext(pathname: string): NavigationContext {
  if (AUTH_PATHS.has(pathname)) return "auth";
  if (pathname.startsWith("/seller")) return "seller";
  if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) {
    return "admin";
  }

  const isClientRoute = CLIENT_BASE_PATHS.some((basePath) =>
    matchesBasePath(pathname, basePath),
  );
  if (isClientRoute) return "client";

  const isPublicRoute = PUBLIC_BASE_PATHS.some((basePath) =>
    matchesBasePath(pathname, basePath),
  );
  if (isPublicRoute) return "public";

  return "public";
}

function isDetailPath(pathname: string): boolean {
  const isProductDetail = pathname.startsWith("/product/");
  const isOrderDetail = pathname.startsWith("/orders/");
  const isMessageDetail = pathname.startsWith("/messages/");
  const isSellerOrderDetail = pathname.startsWith("/seller/orders/");

  return isProductDetail || isOrderDetail || isMessageDetail || isSellerOrderDetail;
}

export function useNavigationContext(): NavigationContextState {
  const location = useLocation();

  return useMemo(() => {
    const pathname = normalizePath(location.pathname);
    const context = detectContext(pathname);
    const isDetailView = isDetailPath(pathname);

    const showBottomNav =
      (context === "public" || context === "client" || context === "seller") &&
      !isDetailView &&
      pathname !== "/checkout";

    return {
      context,
      pathname,
      isDetailView,
      showBottomNav,
    };
  }, [location.pathname]);
}
