import { Link, useNavigate } from "react-router-dom";
import { X, User, Store, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores";

interface RoleSwitchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSwitchBottomSheet({
  isOpen,
  onClose,
}: RoleSwitchBottomSheetProps) {
  const navigate = useNavigate();
  const { user, userMode, switchUserMode, canAccessSellerPortal, logout } =
    useAuthStore();

  if (!isOpen) return null;

  const canSwitchSeller = canAccessSellerPortal();

  const handleSwitchMode = (mode: "buyer" | "seller") => {
    switchUserMode(mode);
    onClose();
    navigate(mode === "seller" ? "/seller/dashboard" : "/profile");
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <section className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-border bg-background shadow-2xl">
        <div className="mx-auto w-full max-w-md px-4 pb-6 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current mode</p>
              <p className="text-lg font-semibold text-foreground">
                {userMode === "seller" ? "Seller" : "Buyer"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="Close role switcher"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.displayName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleSwitchMode("buyer")}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                userMode === "buyer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Buyer mode
              </span>
            </button>

            {canSwitchSeller && (
              <button
                onClick={() => handleSwitchMode("seller")}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  userMode === "seller"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Store className="h-4 w-4" />
                  Seller mode
                </span>
              </button>
            )}
          </div>

          <div className="my-4 border-t border-border" />

          <div className="space-y-1">
            <Link
              to={userMode === "seller" ? "/seller/settings" : "/settings"}
              onClick={onClose}
              className="block rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
