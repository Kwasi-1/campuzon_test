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
  Search,
  Truck,
  X,
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
import { SellerPageTemplate } from "@/pages/seller/components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import { OrderCard } from "@/components/shared/OrderCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [searchExpanded, setSearchExpanded] = useState(false);
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    let orders = [...(storeOrders || [])];

    // Filter by status
    if (effectiveFilter !== "all") {
      orders = orders.filter((o) => o.status === effectiveFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(query) ||
          o.items?.some((item) =>
            item.productName.toLowerCase().includes(query),
          ),
      );
    }

    return orders;
  }, [storeOrders, searchQuery, effectiveFilter]);

  const handleOrderAction = (
    order: (typeof mockSellerOrders)[0],
    action: "ship" | "complete" | "cancel",
  ) => {
    setSelectedOrder(order);
    setActionType(action);
    setActionModalOpen(true);
  };

  const confirmAction = async () => {
    if (selectedOrder && actionType) {
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
    }
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

  // Stats
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

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const sidebar = (
    <div className="space-y-6 xl:sticky xl:top-24">
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
        className="mb-4"
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
          <p className="text-sm font-semibold text-gray-900 truncate">
            {formatGHS(stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <div className="flex w-full items-center justify-end gap-2 md:w-auto">
      <div
        className={`overflow-hidden transition-all duration-300 ${
          searchExpanded ? "w-full sm:w-72" : "w-10"
        }`}
      >
        {searchExpanded ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-full pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => {
                setSearchExpanded(false);
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSearchExpanded(true)}
            className="h-10 w-10 rounded-full"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select
        value={extraFilter}
        onValueChange={(value) => setExtraFilter(value as ExtraFilterKey)}
      >
        <SelectTrigger className="h-10 w-[180px] rounded-full">
          <SelectValue placeholder="More filters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">More Filters</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="disputed">Disputed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <SellerPageTemplate
      title="Orders"
      description={`Manage customer orders (${(storeOrders || []).length} total)`}
      headerActions={headerActions}
      sidebar={sidebar}
    >
      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[340px] w-full rounded-[28px]" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-gray-100 bg-white rounded-[28px] overflow-hidden shadow-sm">
          <div className="text-center py-16 flex flex-col justify-center h-full items-center">
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

      {/* Action Confirmation Modal */}
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
