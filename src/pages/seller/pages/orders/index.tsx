import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MessageCircle,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/stores";
import type { Order, OrderStatus } from "@/types-new";
import {
  useCurrency,
  useMyStore,
  useStoreOrders,
  useUpdateOrderStatus,
} from "@/hooks";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  SellerPageSearchFilters,
  SellerPageTemplate,
} from "@/pages/seller/components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import { OrderCard } from "@/components/shared/OrderCard";

// Mock orders data for seller
const mockSellerOrders: Order[] = [];

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
];

const MAIN_FILTER_KEYS = ["all", "pending", "shipped", "completed"] as const;
type MainFilterKey = (typeof MAIN_FILTER_KEYS)[number];
type ExtraFilterKey =
  | "all"
  | "paid"
  | "processing"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "disputed";

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      };
    case "paid":
      return {
        label: "Paid",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: DollarSign,
      };
    case "processing":
      return {
        label: "Processing",
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: Package,
      };
    case "shipped":
      return {
        label: "Shipped",
        color:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        icon: Truck,
      };
    case "delivered":
      return {
        label: "Delivered",
        color:
          "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        icon: CheckCircle,
      };
    case "completed":
      return {
        label: "Completed",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      };
    case "refunded":
      return {
        label: "Refunded",
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        icon: AlertCircle,
      };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  }
};

export function SellerOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatGHS } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [mainFilter, setMainFilter] = useState<MainFilterKey>("all");
  const [extraFilter, setExtraFilter] = useState<ExtraFilterKey>("all");
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof mockSellerOrders)[0] | null
  >(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "ship" | "complete" | "cancel" | null
  >(null);

  const { data: store } = useMyStore();
  const { data: storeOrders, isLoading } = useStoreOrders(store?.id || "");
  const updateStatus = useUpdateOrderStatus();

  const effectiveFilter = extraFilter !== "all" ? extraFilter : mainFilter;

  const filteredOrders = useMemo(() => {
    let orders = [...(storeOrders || [])];

    if (effectiveFilter !== "all") {
      orders = orders.filter((order) => order.status === effectiveFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
          order.items?.some((item) =>
            item.productName.toLowerCase().includes(query),
          ),
      );
    }

    return orders;
  }, [effectiveFilter, searchQuery, storeOrders]);

  const handleOrderAction = (
    order: (typeof mockSellerOrders)[0],
    action: "ship" | "complete" | "cancel",
  ) => {
    setSelectedOrder(order);
    setActionType(action);
    setActionModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedOrder || !actionType) return;

    const newStatus =
      actionType === "ship"
        ? "shipped"
        : actionType === "complete"
          ? "completed"
          : "cancelled";

    await updateStatus.mutateAsync({
      id: selectedOrder.id,
      status: newStatus as OrderStatus,
    });

    setActionModalOpen(false);
    setSelectedOrder(null);
    setActionType(null);
  };

  const getActionLabel = () => {
    switch (actionType) {
      case "ship":
        return "Mark as Shipped";
      case "complete":
        return "Mark as Completed";
      case "cancel":
        return "Cancel Order";
      default:
        return "";
    }
  };

  const stats = useMemo(() => {
    const orders = storeOrders || [];
    const pending = orders.filter(
      (o) => o.status === "pending" || o.status === "paid",
    ).length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const completed = orders.filter(
      (o) => o.status === "completed" || o.status === "delivered",
    ).length;
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { pending, shipped, completed, totalRevenue };
  }, [storeOrders]);

  const statusCounts = useMemo(() => {
    const orders = storeOrders || [];
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      refunded: orders.filter((o) => o.status === "refunded").length,
      disputed: orders.filter((o) => o.status === "disputed").length,
    };
  }, [storeOrders]);

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const sidebar = (
    <div className="space-y-6 xl:sticky xl:top-32">
      <PillSidebar
        options={STATUS_OPTIONS.filter((option) =>
          MAIN_FILTER_KEYS.includes(option.value as MainFilterKey),
        ).map((option) => ({
          key: option.value,
          label: option.label,
          count: statusCounts[option.value as keyof typeof statusCounts] ?? 0,
        }))}
        activeKey={mainFilter}
        onChange={(key) => {
          setMainFilter(key as MainFilterKey);
          setExtraFilter("all");
        }}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-semibold text-gray-900">{stats.pending}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Shipped</p>
          <p className="text-lg font-semibold text-gray-900">{stats.shipped}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="truncate text-sm font-semibold text-gray-900">
            {formatGHS(stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <SellerPageSearchFilters
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search orders..."
      selectValue={extraFilter}
      onSelectChange={(value) => setExtraFilter(value as ExtraFilterKey)}
      selectPlaceholder="More filters"
      selectOptions={[
        { value: "all", label: "More Filters" },
        { value: "paid", label: "Paid" },
        { value: "processing", label: "Processing" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
        { value: "refunded", label: "Refunded" },
        { value: "disputed", label: "Disputed" },
      ]}
    />
  );

  return (
    <SellerPageTemplate
      title="Orders"
      description={`Manage customer orders (${(storeOrders || []).length} total)`}
      headerActions={headerActions}
      sidebar={sidebar}
    >
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[340px] w-full rounded-[28px]" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <EmptyState
              icon={<Package className="h-16 w-16" />}
              title={
                searchQuery || effectiveFilter !== "all"
                  ? "No matching orders"
                  : "No orders yet"
              }
              description={
                searchQuery || effectiveFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Orders from customers will appear here"
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard
                  order={order}
                  formatAmount={formatGHS}
                  statusBadge={
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  }
                  footerActions={
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link to={`/seller/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/messages?order=${order.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <MessageCircle className="mr-1 h-4 w-4" />
                          Chat
                        </Button>
                      </Link>
                      <a href={`tel:${order.shippingAddress?.phone || ""}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <Phone className="mr-1 h-4 w-4" />
                          Call
                        </Button>
                      </a>

                      {(order.status === "paid" ||
                        order.status === "processing") && (
                        <Button
                          size="sm"
                          onClick={() => handleOrderAction(order, "ship")}
                          className="rounded-full"
                        >
                          <Truck className="mr-1 h-4 w-4" />
                          Ship
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderAction(order, "complete")}
                          className="rounded-full text-green-600"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Complete
                        </Button>
                      )}
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOrderAction(order, "cancel")}
                          className="rounded-full text-red-600"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={getActionLabel()}
      >
        <div className="space-y-4">
          <p>
            {actionType === "cancel"
              ? `Are you sure you want to cancel order ${selectedOrder?.orderNumber}? This will refund the customer.`
              : `Confirm ${actionType === "ship" ? "shipping" : "completion"} for order ${selectedOrder?.orderNumber}?`}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {getActionLabel()}
            </Button>
          </div>
        </div>
      </Modal>
    </SellerPageTemplate>
  );
}
