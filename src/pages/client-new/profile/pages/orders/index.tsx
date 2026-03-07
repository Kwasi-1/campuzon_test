import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  ChevronRight,
  Search,
  Store,
  Calendar,
  MessageCircle,
} from "lucide-react";
import {
  OrderCardSkeleton,
} from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";  
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";  
import { Badge } from "@/components/ui/badge"
import { useMyOrders } from "@/hooks";
import { useAuthStore } from "@/stores";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return Clock;
    case "paid":
    case "processing":
      return Package;
    case "shipped":
      return Truck;
    case "delivered":
    case "completed":
      return CheckCircle;
    case "cancelled":
    case "refunded":
      return XCircle;
    case "disputed":
      return AlertCircle;
    default:
      return Package;
  }
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading } = useMyOrders(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  );

  const displayOrders = orders || [];

  // Filter orders
  const filteredOrders = displayOrders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) {
    navigate("/login?redirect=/orders");
    return null;
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your orders
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg border border-gray-200 mb-5">
          {/* Status Tabs */}
          <div className="border-b border-gray-200 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-0">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === tab.value
                      ? "border-b-primary text-primary"
                      : "border-b-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16">
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
                  : "When you place orders, they'll appear here"
              }
              action={
                <Link to="/products">
                  <Button className="rounded-full px-8">Start Shopping</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              const primaryItem = order.items?.[0];
              const otherItemsCount = (order.items?.length || 1) - 1;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(order.dateCreated)}</span>
                      </div>
                      {order.store && (
                        <>
                          <span className="text-gray-400 hidden sm:inline">
                            |
                          </span>
                          <Link
                            to={`/stores/${order.store.storeSlug}`}
                            className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-primary"
                          >
                            <Store className="h-3.5 w-3.5" />
                            <span>{order.store.storeName}</span>
                          </Link>
                        </>
                      )}
                    </div>
                    <Badge
                      className={`${getOrderStatusColor(order.status)} rounded-full text-xs`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Order Body */}
                  <div className="flex gap-4 p-5">
                    {/* Product Image */}
                    <Link to={`/orders/${order.id}`} className="shrink-0">
                      <img
                        src={
                          primaryItem?.productImage ||
                          "/placeholder-product.jpg"
                        }
                        alt={primaryItem?.productName || "Order item"}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
                      />
                    </Link>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-gray-900 hover:text-primary hover:underline line-clamp-1 text-sm sm:text-base"
                        >
                          {primaryItem?.productName}
                        </Link>
                        {otherItemsCount > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            +{otherItemsCount} more item
                            {otherItemsCount > 1 ? "s" : ""}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.items?.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            ) || 1}{" "}
                            item
                            {(order.items?.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            ) || 1) > 1
                              ? "s"
                              : ""}
                          </span>
                          <span className="capitalize">
                            {order.deliveryMethod}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <div className="flex gap-2">
                          {order.conversationID && (
                            <Link to={`/messages/${order.conversationID}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-sm"
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                Message
                              </Button>
                            </Link>
                          )}
                          <Link to={`/orders/${order.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-sm"
                            >
                              View order
                              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
