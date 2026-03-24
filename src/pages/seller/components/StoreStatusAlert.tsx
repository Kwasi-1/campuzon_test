import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, Lock, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useSellerMyStore } from "@/hooks/useSellerPortal";
import { Button } from "@/components/ui/button";

export function StoreStatusAlert() {
  const { data: store, isLoading } = useSellerMyStore();
  const previousStatus = useRef<string | undefined>();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (isLoading || !store) return;

    if (hasMounted.current) {
      if (
        store.status === "active" &&
        previousStatus.current &&
        previousStatus.current !== "active"
      ) {
        toast.success("Your store is now active! You can begin selling.", {
          id: "store-active-toast",
          duration: 5000,
        });
      }
    }

    previousStatus.current = store.status;
    hasMounted.current = true;
  }, [store?.status, isLoading]);

  if (isLoading || !store || store.status === "active") return null;

  let alertConfig = {
    title: "Store Pending",
    description:
      "Your store is currently pending approval. We will notify you once reviewed.",
    icon: Clock,
    colorClass: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600",
  };

  switch (store.status) {
    case "pending":
      // already default
      break;
    case "suspended":
      alertConfig = {
        title: "Store Suspended",
        description:
          "Your store has been suspended. Please contact support to resolve this issue.",
        icon: AlertCircle,
        colorClass: "border-red-200 bg-red-50 text-red-900",
        iconColor: "text-red-600",
      };
      break;
    case "closed":
      alertConfig = {
        title: "Store Closed",
        description: "Your store is closed. Contact support for next steps.",
        icon: Lock,
        colorClass: "border-gray-200 bg-gray-50 text-gray-900",
        iconColor: "text-gray-600",
      };
      break;
  }

  const Icon = alertConfig.icon;

  return (
    <div className="container mx-auto px-4 mt-4 md:mt-6">
      <Alert
        className={`flex flex-col md:flex-row items-start md:items-center border justify-start md:justify-between ${store.status != "pending" && "md:py-3"} ${alertConfig.colorClass}`}
      >
        <div className="flex items-center">
          <Icon
            className={`hidden md:block h-5 w-5 mr-3 mt-0.5 ${alertConfig.iconColor}`}
          />

          {alertConfig.description}
        </div>
        {store.status != "pending" && (
          <Button
            variant="link"
            onClick={() => {
              window.location.href = `mailto:support@campuzon.me?subject=Store Reactivation Request - ${encodeURIComponent(
                store?.storeName || "Seller Store",
              )}`;
            }}
            className="text-red-900 hidden md:block py-0"
          >
            Request Reactivation
          </Button>
        )}
      </Alert>
    </div>
  );
}
