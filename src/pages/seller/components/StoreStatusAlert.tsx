import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, Lock, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useSellerMyStore } from "@/hooks/useSellerPortal";

const getStoreActionBlockReason = (storeStatus?: string) => {
  switch (storeStatus) {
    case "pending":
      return "Your store is not active. Please wait for approval.";
    case "suspended":
      return "Your store is suspended. Only admin can reactivate this store.";
    case "closed":
      return "Your store is closed. Contact support for next steps.";
    default:
      return null;
  }
};

export function StoreStatusAlert() {
  const { data: store, isLoading } = useSellerMyStore();
  const previousStatus = useRef<string | undefined>();
  const hasMounted = useRef(false);
  const storeActionBlockReason = getStoreActionBlockReason(store?.status);

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
    <div className="container mx-auto px-4 mt-6">
      <Alert className={`flex items-center border ${alertConfig.colorClass}`}>
        <div className="flex items-center gap1">
          <Icon className={`h-5 w-5 mr-3 mt-0.5 ${alertConfig.iconColor}`} />

          {alertConfig.description}

          {/* <AlertDescription>{alertConfig.description}</AlertDescription> */}
        </div>
      </Alert>
      <Alert className={`mb-6 border-amber-200 bg-amber-50 text-amber-900`}>
        {storeActionBlockReason || "Store status unavailable."}
      </Alert>
    </div>
  );
}
