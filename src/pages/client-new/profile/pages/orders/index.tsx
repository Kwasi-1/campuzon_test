import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useMyOrders } from "@/hooks";
import { useAuthStore, useCartStore } from "@/stores";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
    case "paid":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

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

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleBuyAgain = async (order: Order) => {
    try {
      if (order.store && order.items) {
        for (const item of order.items) {
           // We might not have the full Product object in OrderItem,
           // but keeping the logic flowing gracefully assuming typical reorder flow
           // In this implementation, normally we redirect to product or use actual product details
           navigate(`/products/${item.productID}`);
           break; // Let's just navigate to the first product to allow adding to cart
        }
      }
    } catch (error) {
      toast.error("Failed to add items to cart");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-wide font-[700] text-gray-900 mb-2">
          Order History
        </h1>
        <p className="text-gray-600">Track and view all your previous orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number or product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 rounded-md" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="min-h-[calc(100vh-310px)]">
          <CardContent className="text-center py-12 flex flex-col justify-center h-full">
            <EmptyState
              icon={<Package className="h-16 w-16 text-gray-400 mb-4" />}
              title={
                searchQuery || statusFilter !== "all"
                  ? "No matching orders"
                  : "No orders yet"
              }
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start shopping to see your orders here"
              }
              action={
                <Button onClick={() => navigate("/products")} className="mt-4">
                  Start Shopping
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const itemCount =
              order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const primaryItem = order.items?.[0];

            return (
              <Card key={order.id}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.dateCreated).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(order.status)} capitalize`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold">{itemCount} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery</p>
                      <div className="flex items-center font-medium">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-500" />
                        <p className="text-sm">
                          {order.deliveryAddress || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="capitalize">{order.deliveryMethod} Delivery</span>
                        {primaryItem?.productName && (
                          <span className="block ml-4 text-xs font-normal text-muted-foreground line-clamp-1 max-w-[200px]">
                            Includes {primaryItem.productName}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          <Icon icon="octicon:eye-24" className="w-4 h-4 mr-1" />
                          <span>View Details</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBuyAgain(order)}
                        >
                          <Icon icon="pajamas:retry" className="w-4 h-4 mr-1" />
                          <span>Buy Again</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
