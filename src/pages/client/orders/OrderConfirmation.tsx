import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import orderService from "@/services/orderService";
import { useApiState } from "@/hooks/useApiState";
import { Order } from "@/types";
import AppLoader from "@/components/AppLoader";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // API state for order details
  const orderData = useApiState<Order>({
    initialData: null,
  });

  // Load order data on mount or when orderId changes
  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        try {
          const order = await orderService.getOrderById(orderId);
          orderData.setData(order);
        } catch (error) {
          console.error("Error loading order:", error);
          // If specific order not found, try to get latest order
          try {
            const ordersResult = await orderService.getOrders({ limit: 1 });
            if (ordersResult.orders.length > 0) {
              orderData.setData(ordersResult.orders[0]);
            }
          } catch {
            orderData.setData(null);
          }
        }
      } else {
        // Load latest order if no specific orderId
        try {
          const ordersResult = await orderService.getOrders({ limit: 1 });
          if (ordersResult.orders.length > 0) {
            orderData.setData(ordersResult.orders[0]);
          }
        } catch (error) {
          console.error("Error loading latest order:", error);
          orderData.setData(null);
        }
      }
    };

    loadOrder();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const order = orderData.data;

  if (orderData.isLoading) {
    return <AppLoader />;
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-110px)] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Order Found</h2>
          <p className="text-gray-600 mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/orders")}>
            View Order History
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600";
      case "In Transit":
        return "text-blue-600";
      case "Processing":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "In Transit":
        return <Truck className="w-6 h-6 text-blue-600" />;
      case "Processing":
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const trackingSteps = [
    { status: "Processing", label: "Order Confirmed", completed: true },
    {
      status: "Processing",
      label: "Preparing Your Order",
      completed: order.status !== "Processing",
    },
    {
      status: "In Transit",
      label: "Out for Delivery",
      completed: order.status === "Delivered" || order.status === "In Transit",
    },
    {
      status: "Delivered",
      label: "Delivered",
      completed: order.status === "Delivered",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-110px)] bg-gray-50">
      <div className="max-w-4xl mx-auto section-padding py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {orderId ? "Track Order" : "Order Confirmation"}
          </h1>
          <p className="text-gray-600">
            {orderId
              ? "Track your order status and delivery progress"
              : "Your order has been confirmed and is being processed"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    Order {order.id}
                  </CardTitle>
                  <Badge
                    className={`${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "In Transit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium">
                      GH₵ {order.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Method</p>
                    <p className="font-medium">{order.deliveryMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          step.completed
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            step.completed ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {step.completed && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.itemCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.store}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          GH₵ {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{order.deliveryAddress}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {order.estimatedDelivery}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="tel:+233123456789">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="mailto:support@groceryhub.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/orders")}
              >
                Order History
              </Button>
              <Button className="flex-1" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
