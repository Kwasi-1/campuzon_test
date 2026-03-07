import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Truck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Hero from "@/components/Hero";
import { Icon } from "@iconify/react/dist/iconify.js";
import AppLoader from "@/components/AppLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { PaystackButton } from "react-paystack";
import { cartService, orderService } from "@/services";
import { useApiState } from "@/hooks/useApiState";
import { CartItem } from "@/types";
import { CartSummary } from "@/services/cartService";
import { toast } from "sonner";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
    getTotalItems,
  } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // API state for cart data
  const cartData = useApiState<CartSummary>({
    initialData: null,
    onError: (error) => toast.error(`Failed to load cart: ${error}`),
  });

  // Paystack configuration
  const publicKey =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
    "pk_test_c8e9fcf6be7da2f938b8d277203a0b781fff6c39";

  // Load cart data on mount
  useEffect(() => {
    const loadCartData = async () => {
      try {
        await cartData.execute(() => cartService.getCart());
      } catch (error) {
        console.error("Failed to load cart data:", error);
      }
    };

    if (user) {
      loadCartData();
    }
  }, [user, cartData]);

  // Handle quantity updates
  const handleQuantityChange = async (
    productId: number | string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateCartItem({
        itemId: productId,
        quantity: newQuantity,
      });

      // Also update local context
      updateQuantity(
        typeof productId === "string" ? parseInt(productId) : productId,
        newQuantity
      );

      // Reload cart data
      await cartData.execute(() => cartService.getCart());

      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart item");
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId: number | string) => {
    try {
      await cartService.removeFromCart({
        itemId: productId,
      });

      // Also update local context
      removeFromCart(
        typeof productId === "string" ? parseInt(productId) : productId
      );

      // Reload cart data
      await cartData.execute(() => cartService.getCart());

      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item from cart");
    }
  };

  // Get totals (prefer API data, fallback to local context)
  const apiCartData = cartData.data;
  const subtotal = apiCartData?.total || getTotalPrice();
  const deliveryFee = deliveryMethod === "express" ? 50 : 25;
  const total = subtotal + deliveryFee;

  // Use API cart items if available, otherwise use context
  const displayCartItems = apiCartData?.items || cartItems;

  // Paystack payment configuration
  const paymentConfig = {
    reference: `order_${new Date().getTime()}`,
    email: user?.email || "",
    amount: Math.round(total * 100), // Paystack expects amount in kobo (GHS * 100)
    publicKey: publicKey,
    currency: "GHS",
    channels: paymentMethod === "momo" ? ["mobile_money"] : ["card"],
    metadata: {
      custom_fields: [
        {
          display_name: "Order ID",
          variable_name: "order_id",
          value: `order_${new Date().getTime()}`,
        },
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: user?.name || "Guest Customer",
        },
      ],
    },
  };

  const handlePaystackSuccess = async (reference: { reference: string }) => {
    setIsProcessing(true);

    try {
      // Create order via API
      const orderData = {
        items: displayCartItems,
        total,
        deliveryAddress: "East Legon, Accra", // This should come from a form
        deliveryMethod:
          deliveryMethod === "express"
            ? "Express Delivery"
            : "Standard Delivery",
        paymentMethod:
          paymentMethod === "card" ? "Credit/Debit Card" : "Mobile Money",
        paymentReference: reference.reference,
      };

      // Add order via API (if service exists)
      // const createdOrder = await orderService.createOrder(orderData);

      // For now, also add to local context
      addOrder({
        ...orderData,
        itemCount: getTotalItems(),
        paymentStatus: "Paid",
      });

      // Clear cart via API
      try {
        await cartService.clearCart();
        // Also clear local context
        clearCart();
      } catch (error) {
        console.error("Failed to clear cart via API:", error);
        // Still clear local context
        clearCart();
      }

      // Show success toast
      showToast({
        title: "Payment Successful!",
        description: `Your order of GH₵ ${total.toLocaleString()} has been successfully paid and confirmed.`,
      });

      // Navigate to order confirmation
      navigate("/order-confirmation", {
        state: {
          paymentReference: reference.reference,
          amount: total,
        },
      });
    } catch (error) {
      showToast({
        title: "Order Processing Failed",
        description:
          "Payment was successful but there was an error processing your order. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    showToast({
      title: "Payment Cancelled",
      description:
        "Your payment was cancelled. Your cart items are still saved.",
      variant: "destructive",
    });
  };

  const handleCashOnDeliveryOrder = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API for cash on delivery
      const orderData = {
        items: displayCartItems,
        total,
        deliveryAddress: "East Legon, Accra", // This should come from a form
        deliveryMethod:
          deliveryMethod === "express"
            ? "Express Delivery"
            : "Standard Delivery",
        paymentMethod: "Cash on Delivery",
        paymentReference: `cod_${new Date().getTime()}`,
      };

      // Add order via API (if service exists)
      // const createdOrder = await orderService.createOrder(orderData);

      // For now, also add to local context
      addOrder({
        ...orderData,
        itemCount: getTotalItems(),
        paymentStatus: "Pending",
      });

      // Clear cart via API
      try {
        await cartService.clearCart();
        clearCart();
      } catch (error) {
        console.error("Failed to clear cart via API:", error);
        clearCart();
      }

      showToast({
        title: "Order Placed!",
        description: `Your cash on delivery order of GH₵ ${total.toLocaleString()} has been placed successfully.`,
      });

      navigate("/order-confirmation", {
        state: {
          paymentReference: `cod_${new Date().getTime()}`,
          amount: total,
          paymentMethod: "Cash on Delivery",
        },
      });
    } catch (error) {
      showToast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while fetching cart data
  // if (cartData.isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <AppLoader />
  //     </div>
  //   );
  // }

  return (
    <div>
      <div className="max-w-7xl mx-auto section-padding py-8 min-h-[calc(100vh-110px)]">
        {/* Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <Link to="/products">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 hidden mt-4">
              Shopping Cart
            </h1>
            <p className="text-gray-600 hidden">
              {displayCartItems.length} items in your cart
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wide font-[700] text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        {cartData.isLoading ? (
          // ...existing skeleton code...
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Skeleton className="w-full sm:w-24 h-24 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="w-8 h-8" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-8 w-32" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : displayCartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              <Icon
                icon="fluent-emoji:shopping-cart"
                className="inline-block md:w-20 md:h-20 text-gray-400"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some products to get started!
            </p>
            <Link to="/products">
              <Button size="lg" className="btn-primary">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - existing code remains the same */}
            <div className="lg:col-span-2 space-y-4">
              {displayCartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full sm:w-24 h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-[500] text-lg">{item.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="secondary">{item.store}</Badge>
                              <span>•</span>
                              <Truck className="w-4 h-4" />
                              <span>2-4 hours</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-primary text-lg">
                              GH₵{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </div>
                            {item.originalPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                GH₵{" "}
                                {(
                                  item.originalPrice * item.quantity
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="space-y-6">
              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">
                        <div className="flex justify-between">
                          <span>Standard Delivery</span>
                          <span className="font-medium">GH₵ 25</span>
                        </div>
                        <div className="text-sm text-gray-600">2-6 hours</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1">
                        <div className="flex justify-between">
                          <span>Express Delivery</span>
                          <span className="font-medium">GH₵ 50</span>
                        </div>
                        <div className="text-sm text-gray-600">1-2 hours</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>GH₵ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>GH₵ {deliveryFee}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        GH₵ {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo">Mobile Money</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>

                  {(paymentMethod === "card" || paymentMethod === "momo") && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-blue-800 mb-2">
                        <Icon icon="logos:paystack" className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">
                          Secured by Paystack
                        </span>
                      </div>
                      <p className="text-xs text-blue-600">
                        Your payment is secured with bank-level encryption
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Checkout Button */}
              {!user ? (
                <Button
                  size="lg"
                  className="w-full btn-primary mt-3"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Sign In to Complete Order - GH₵ {total.toLocaleString()}
                </Button>
              ) : paymentMethod === "cash" ? (
                <Button
                  size="lg"
                  className="w-full btn-primary mt-3"
                  onClick={handleCashOnDeliveryOrder}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Place Order - GH₵ ${total.toLocaleString()}`}
                </Button>
              ) : (
                <PaystackButton
                  {...paymentConfig}
                  text={`Pay Now - GH₵ ${total.toLocaleString()}`}
                  onSuccess={handlePaystackSuccess}
                  onClose={handlePaystackClose}
                  className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                />
              )}

              <div className="text-center text-sm text-gray-600">
                <span>Secure checkout • SSL encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to be signed in to complete your order. Please sign in to
              continue with your checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link to="/login" className="flex-1">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
