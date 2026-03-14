import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Eye,
  MessageCircle,
  Phone,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/stores";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";
import { useMyStore, useStoreOrders, useUpdateOrderStatus } from "@/hooks";
import { Skeleton } from "@/components/shared/Skeleton";

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
];

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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    let orders = [...(storeOrders || [])];

    // Filter by status
    if (statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter);
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
  }, [storeOrders, searchQuery, statusFilter]);

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

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders ({(storeOrders || []).length} total)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
            <p className="text-sm text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(stats.totalRevenue)}
            </p>
            <p className="text-sm text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title={
            searchQuery || statusFilter !== "all"
              ? "No matching orders"
              : "No orders yet"
          }
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Orders from customers will appear here"
          }
        />
      ) : (
        <div className="space-y-4">
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
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {order.orderNumber}
                              </span>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatRelativeTime(order.dateCreated)}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>

                        {/* Customer */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {order.shippingAddress?.fullName?.[0] || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {order.shippingAddress?.fullName || "Customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress?.phone || "No phone"}
                            </p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items?.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {item.productName}
                                </p>
                                <p className="text-muted-foreground">
                                  {item.quantity}x @{" "}
                                  {formatPrice(item.unitPrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info */}
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Deliver to: {order.shippingAddress?.addressLine1},{" "}
                              {order.shippingAddress?.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2">
                        <Link to={`/seller/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/messages?order=${order.id}`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                        <a href={`tel:${order.shippingAddress?.phone}`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </a>

                        {/* Status Actions */}
                        {(order.status === "paid" ||
                          order.status === "processing") && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order, "ship")}
                            className="w-full"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Ship
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOrderAction(order, "complete")}
                            className="w-full text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOrderAction(order, "cancel")}
                            className="w-full text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
    </div>
  );
}
