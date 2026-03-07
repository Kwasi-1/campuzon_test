import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Loader2,
  Info,
  Eye,
  Bell,
  MessageCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import orderService from "@/services/orderService";
import { useApiState } from "@/hooks/useApiState";
import { Order } from "@/types";

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [trackingNumber, setTrackingNumber] = useState(id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // API state for order details
  const orderData = useApiState<Order>({
    initialData: null,
  });

  // API state for tracking information
  const trackingData = useApiState<{
    status: string;
    history: Array<{
      status: string;
      timestamp: string;
      description: string;
    }>;
    estimatedDelivery?: string;
    trackingNumber?: string;
  }>({
    initialData: null,
  });

  // Load order if ID is provided in params
  useEffect(() => {
    if (id) {
      handleTrackOrder();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter a valid order number");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Get order details
      const order = await orderService.getOrderById(trackingNumber);
      orderData.setData(order);

      // Get tracking information
      const trackingInfo = await orderService.trackOrder(trackingNumber);
      trackingData.setData(trackingInfo);

      toast.success("Order found successfully!");
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Order not found. Please check your order number and try again."
      );
      orderData.setData(null);
      trackingData.setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const order = orderData.data;
  const tracking = trackingData.data;
  const isTracking = !!order && !!tracking;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "current":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-gray-400 bg-gray-100";
      default:
        return "text-gray-400 bg-gray-100";
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "Processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "In Transit":
        return <Badge className="bg-orange-500">In Transit</Badge>;
      case "Delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    setHasSearched(false);
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Track Your Order"
        description="Track your grocery delivery in real-time. Enter your order number to get live updates on your delivery status and estimated arrival time."
        keywords="order tracking, delivery tracking, grocery delivery, order status, Ghana delivery"
      />
      {/* <Hero
        title="Track Your Order"
        subtitle="Enter your order ID to see real-time delivery updates"
      /> */}
      <div className="max-w-6xl mx-auto section-padding py-8 md:py-12 xl:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wide font-[700] text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order number to see real-time updates
          </p>
        </div>
        {/* Header */}
        <div className="text-center mb-8 hidden">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order number to see real-time updates
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter order number (e.g., GM-2024-001234)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="text-base px-4 md:text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                />
              </div>
              <Button
                onClick={handleTrackOrder}
                className="btn-primary px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                Searching for your order...
              </h3>
              <p className="text-gray-600">
                Please wait while we retrieve your order information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Not Found Message */}
        {!isLoading && hasSearched && !isTracking && trackingNumber && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <Package className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Order Not Found
              </h3>
              <p className="text-red-600 mb-4">
                We couldn't find an order with the number "{trackingNumber}".
                Please check your order number and try again.
              </p>
              <div className="text-sm text-red-500">
                <p>
                  Order numbers typically start with "GM-2024-" followed by 6
                  digits.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isTracking && order && (
          <div className="space-y-8">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      Order #{order.id}
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                      {getOrderStatusBadge(order.status)}
                      <span className="text-gray-600">
                        Total: GH₵ {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="text-sm text-gray-600">
                      Estimated Delivery
                    </div>
                    <div className="font-semibold text-lg text-primary">
                      {order.estimatedDelivery ||
                        tracking?.estimatedDelivery ||
                        "TBD"}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tracking Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Tracking Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {tracking?.history?.map((step, index) => {
                      // Map status to appropriate icon
                      const getStepIcon = (status: string) => {
                        if (status.toLowerCase().includes("confirmed"))
                          return CheckCircle;
                        if (
                          status.toLowerCase().includes("picked") ||
                          status.toLowerCase().includes("processing")
                        )
                          return Package;
                        if (
                          status.toLowerCase().includes("transit") ||
                          status.toLowerCase().includes("delivery")
                        )
                          return Truck;
                        if (status.toLowerCase().includes("delivered"))
                          return CheckCircle;
                        return Clock;
                      };

                      const Icon = getStepIcon(step.status);
                      const isCompleted =
                        index < tracking.history.length - 1 ||
                        step.status.toLowerCase().includes("delivered");
                      const isCurrent =
                        index === tracking.history.length - 1 &&
                        !step.status.toLowerCase().includes("delivered");
                      const stepStatus = isCompleted
                        ? "completed"
                        : isCurrent
                        ? "current"
                        : "pending";

                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-full ${getStatusColor(
                              stepStatus
                            )}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{step.status}</h3>
                              <span className="text-sm text-gray-500">
                                {new Date(step.timestamp).toLocaleDateString()}{" "}
                                {new Date(step.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <div className="space-y-6">
                {/* Driver Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Delivery Driver
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Driver:</span>
                        <span className="font-medium">To be assigned</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">To be assigned</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Location:</span>
                        <span className="font-medium text-primary">
                          In preparation
                        </span>
                      </div>
                      <Button className="w-full btn-secondary mt-4" disabled>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Driver (Not available yet)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{order.deliveryAddress}</p>
                    <Button variant="outline" className="w-full mt-4">
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="secondary">{item.store}</Badge>
                          <span className="text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium text-primary">
                            GH₵ {item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about your order or delivery, we're
                  here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline">Live Chat</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions and Features Section */}
        <Card className="mt-12 bg-white border-gray-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2 flex items-center justify-center font-display tracking-wide font-[600]">
              <Info className="w-6 h-6 mr-2 text-primary" />
              How Order Tracking Works
            </CardTitle>
            <p className="text-gray-600">
              Our comprehensive tracking system keeps you informed every step of
              the way
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Real-time Updates */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Real-time Updates
                </h3>
                <p className="text-gray-600 text-sm">
                  Get live status updates as your order moves through each stage
                  of delivery
                </p>
              </div>

              {/* Driver Information */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Driver Details</h3>
                <p className="text-gray-600 text-sm">
                  See your driver's information, vehicle details, and current
                  location
                </p>
              </div>

              {/* Delivery Timeline */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Delivery Timeline
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your order through confirmation, pickup, transit, and
                  delivery
                </p>
              </div>

              {/* Notifications */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Smart Notifications
                </h3>
                <p className="text-gray-600 text-sm">
                  Receive automatic updates via SMS and email at key milestones
                </p>
              </div>

              {/* Customer Support */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Contact our support team anytime for help with your order
                </p>
              </div>

              {/* Secure Tracking */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">
                  Your order information is protected with enterprise-grade
                  security
                </p>
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-lg mb-3 text-center">
                Getting Started
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">
                    📧 Finding Your Order Number:
                  </h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Check your order confirmation email</li>
                    <li>• Look for numbers starting with "GM-2024-"</li>
                    <li>• Order numbers are 6 digits after the prefix</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🕒 Tracking Frequency:</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Updates every 30 minutes during transit</li>
                    <li>• Real-time updates during delivery</li>
                    <li>• Instant notifications for status changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
