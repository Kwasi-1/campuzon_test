import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react/dist/iconify.js";
import SEO from "@/components/SEO";
import AppLoader from "@/components/AppLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/types";
import orderService from "@/services/orderService";
import cartService from "@/services/cartService";
import { useApiState } from "@/hooks/useApiState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderHistory = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filters and pagination state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // API state for orders
  const ordersData = useApiState<{
    orders: Order[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    initialData: { orders: [], pagination: undefined },
  });

  // Load orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await orderService.getOrders({
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit: perPage,
        });
        ordersData.setData({
          orders: result.orders,
          pagination: result.pagination,
        });
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Error loading orders",
          description:
            error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    };

    loadOrders();
  }, [statusFilter, page, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const orders = ordersData.data?.orders || [];
  const pagination = ordersData.data?.pagination;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (orderId: string) => {
    // Navigate to order tracking page with order ID
    navigate(`/track/${orderId}`);
  };

  const handleBuyAgain = async (order: Order) => {
    try {
      // Add all items from the order to the cart
      for (const item of order.items) {
        await cartService.addToCart({
          productId: item.id,
          quantity: item.quantity,
        });
      }

      toast({
        title: "Items added to cart!",
        description: `${order.itemCount} items from order ${order.id} have been added to your cart.`,
      });

      // Navigate to cart
      navigate("/cart");
    } catch (error) {
      console.error("Error adding items to cart:", error);
      toast({
        title: "Error adding items to cart",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO
        title="Order History"
        description="View and track all your previous orders on Tobra"
        keywords="order history, order tracking, purchase history, Tobra orders"
      />

      <div className="container mx-auto px-4 py-8 md:p-16 min-h-[calc(100vh-110px)]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display tracking-wide font-[700] text-gray-900 mb-2">
              Order History
            </h1>
            <p className="text-gray-600">
              Track and view all your previous orders
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setPage(1);
                  setStatusFilter(v);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Per page</span>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPage(1);
                  setPerPage(parseInt(v));
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={String(perPage)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {ordersData.isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-5 w-14" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="min-h-[calc(100vh-310px)]">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start shopping to see your orders here
                </p>
                <Button onClick={() => navigate("/products")}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold">
                          GH₵ {order.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="font-semibold">{order.itemCount} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Delivery</p>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {order.estimatedDelivery}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order.id)}
                          >
                            <Icon icon="octicon:eye-24" className="w-4 h-4" />
                            <span className="hidden md:inline-block ml-1">
                              View Details
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBuyAgain(order)}
                          >
                            <Icon icon="pajamas:retry" className="w-4 h-4" />
                            <span className="hidden md:inline-block ml-1">
                              {" "}
                              Buy Again
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
