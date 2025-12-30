import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  Store as StoreIcon,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Clock,
  Package,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Alert,
  Breadcrumb,
} from '@/components/ui';
import { useCartStore, useAuthStore } from '@/stores';
import { useCreateOrder } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import type { DeliveryMethod } from '@/types';

type PaymentMethod = 'mobile_money' | 'card';
type CheckoutStep = 'delivery' | 'payment' | 'review';

const MOBILE_MONEY_PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', icon: '🟡', prefix: '024, 054, 055, 059' },
  { id: 'vodafone', name: 'Vodafone Cash', icon: '🔴', prefix: '020, 050' },
  { id: 'airteltigo', name: 'AirtelTigo Money', icon: '🔵', prefix: '027, 057, 026, 056' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, storeID, storeName } = useCartStore();
  const createOrder = useCreateOrder();

  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [buyerNote, setBuyerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [selectedProvider, setSelectedProvider] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 15 : 0; // GHS 15 delivery fee
  const serviceFee = subtotal * 0.05; // 5% platform fee
  const total = subtotal + deliveryFee + serviceFee;

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, navigate]);

  const steps: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNextStep = () => {
    if (currentStep === 'delivery') {
      if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
        setError('Please enter a delivery address');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (paymentMethod === 'mobile_money' && !phoneNumber.trim()) {
        setError('Please enter your phone number');
        return;
      }
      setCurrentStep('review');
    }
    setError(null);
  };

  const handlePrevStep = () => {
    if (currentStep === 'payment') setCurrentStep('delivery');
    else if (currentStep === 'review') setCurrentStep('payment');
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (!storeID) return;

    setIsProcessing(true);
    setError(null);

    try {
      const orderData = {
        storeID,
        items: items.map((item) => ({
          productID: item.product.id,
          quantity: item.quantity,
        })),
        deliveryMethod,
        deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        deliveryNotes: deliveryNotes || undefined,
        buyerNote: buyerNote || undefined,
        institutionID: user?.institutionID || undefined,
        hallID: user?.hallID || undefined,
      };

      await createOrder.mutateAsync(orderData);
      navigate('/order-confirmation');
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' },
        ]}
        className="mb-6"
      />

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Delivery Step */}
            {currentStep === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Delivery Options */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          deliveryMethod === 'pickup'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              deliveryMethod === 'pickup'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <StoreIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Campus Pickup</p>
                            <p className="text-sm text-muted-foreground">Free</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Meet the seller at a convenient campus location
                        </p>
                      </button>

                      <button
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          deliveryMethod === 'delivery'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              deliveryMethod === 'delivery'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Door Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(15)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Delivered to your hall or address
                        </p>
                      </button>
                    </div>

                    {/* Delivery Address */}
                    {deliveryMethod === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Delivery Address *
                          </label>
                          <Input
                            placeholder="e.g., Legon Hall, Room A101"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Delivery Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="Any special instructions for delivery..."
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            rows={2}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Pickup Instructions */}
                    {deliveryMethod === 'pickup' && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">How pickup works</p>
                            <ul className="text-muted-foreground mt-1 space-y-1">
                              <li>• Seller will contact you to arrange pickup</li>
                              <li>• Meet at a safe, public campus location</li>
                              <li>• Inspect item before confirming delivery</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Note to Seller */}
                    <div className="pt-4 border-t">
                      <label className="block text-sm font-medium mb-2">
                        Note to Seller (Optional)
                      </label>
                      <Textarea
                        placeholder="Any message for the seller..."
                        value={buyerNote}
                        onChange={(e) => setBuyerNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Options */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('mobile_money')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === 'mobile_money'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              paymentMethod === 'mobile_money'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-sm text-muted-foreground">
                              MTN, Vodafone, AirtelTigo
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              paymentMethod === 'card'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Card Payment</p>
                            <p className="text-sm text-muted-foreground">
                              Visa, Mastercard
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Mobile Money Details */}
                    {paymentMethod === 'mobile_money' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            Select Provider
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {MOBILE_MONEY_PROVIDERS.map((provider) => (
                              <button
                                key={provider.id}
                                onClick={() => setSelectedProvider(provider.id)}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${
                                  selectedProvider === provider.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <span className="text-2xl">{provider.icon}</span>
                                <p className="text-xs font-medium mt-1">
                                  {provider.name.split(' ')[0]}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            placeholder="024 XXX XXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll receive a prompt to authorize payment
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Card Payment Notice */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-muted/50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Secure Card Payment</p>
                            <p className="text-muted-foreground mt-1">
                              You'll be redirected to our secure payment partner
                              (Paystack) to complete your card payment.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Escrow Notice */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Escrow Protection
                          </p>
                          <p className="text-green-700 dark:text-green-300 mt-1">
                            Your payment is held securely until you confirm receipt
                            of your order. Funds are only released to the seller
                            after you're satisfied.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={item.product.images?.[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {deliveryMethod === 'pickup' ? (
                          <>
                            <StoreIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Campus Pickup</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{deliveryAddress}</span>
                          </>
                        )}
                      </div>
                      {deliveryNotes && (
                        <p className="text-muted-foreground">
                          Notes: {deliveryNotes}
                        </p>
                      )}
                      {buyerNote && (
                        <p className="text-muted-foreground">
                          Message to seller: {buyerNote}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      {paymentMethod === 'mobile_money' ? (
                        <>
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {MOBILE_MONEY_PROVIDERS.find((p) => p.id === selectedProvider)?.name} - {phoneNumber}
                          </span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>Card Payment via Paystack</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep !== 'delivery' ? (
              <Button variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link to="/cart">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            )}

            {currentStep !== 'review' ? (
              <Button onClick={handleNextStep}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order - {formatPrice(total)}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length > 1 ? 's' : ''} from{' '}
                <Link
                  to={`/stores/${storeName}`}
                  className="text-primary hover:underline"
                >
                  {storeName}
                </Link>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <img
                      src={item.product.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.product.name}</p>
                      <p className="text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {deliveryMethod === 'delivery' ? formatPrice(deliveryFee) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee (5%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {deliveryMethod === 'pickup'
                      ? 'Pickup arranged by seller'
                      : 'Estimated delivery: 1-3 days'}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Protected by Escrow</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
