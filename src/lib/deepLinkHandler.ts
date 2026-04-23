export type RequiredUserMode = "buyer" | "seller" | null;

const AUTH_PAGES = new Set([
  "/login",
  "/register",
  "/verify-2fa",
  "/verify-account",
]);

const BUYER_ONLY_PREFIXES = [
  "/profile",
  "/orders",
  "/messages",
  "/wishlist",
  "/addresses",
  "/payments",
  "/notifications",
  "/settings",
] as const;

function tryDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizePath(path: string): string {
  if (!path) return "/";
  if (path === "/") return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function toInternalPath(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("#")) {
    return `/${trimmed}`;
  }

  return `/${trimmed}`;
}

export function parseRedirectTarget(
  rawRedirect: string | null | undefined,
  fallback: string = "/",
): string {
  const decoded = tryDecode(rawRedirect || "");
  const asInternalPath = toInternalPath(decoded);

  if (!asInternalPath) return fallback;

  const normalized = normalizePath(asInternalPath.split("?")[0].split("#")[0]);
  if (AUTH_PAGES.has(normalized)) {
    return fallback;
  }

  return asInternalPath;
}

export function buildLoginRedirectPath(targetPath: string): string {
  return `/login?redirect=${encodeURIComponent(targetPath)}`;
}

export function getRequiredUserMode(pathname: string): RequiredUserMode {
  if (pathname.startsWith("/seller")) {
    return "seller";
  }

  const requiresBuyer = BUYER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (requiresBuyer) {
    return "buyer";
  }

  return null;
}
