import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  Copy,
  Check,
  ArrowLeft,
  Shield,
  Star,
  RefreshCw,
  Ban,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  Breadcrumb,
  Skeleton,
  Modal,
  Textarea,
} from '@/components/ui';
import { useOrder, useConfirmDelivery, useCancelOrder, useRequestRefund } from '@/hooks';
import { useAuthStore } from '@/stores';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

// Mock order for display
const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'CPZ-ABC123',
  userID: 'user-1',
  storeID: 'store-1',
  status: 'delivered',
  deliveryMethod: 'pickup',
  subtotal: 5500,
  deliveryFee: 0,
  serviceFee: 275,
  discount: 0,
  totalAmount: 5775,
  deliveryAddress: null,
  deliveryNotes: null,
  buyerNote: 'Please keep it safe',
  sellerNote: 'Order ready for pickup at Balme Library',
  paidAt: '2024-12-20T10:00:00Z',
  shippedAt: '2024-12-21T10:00:00Z',
  deliveredAt: '2024-12-22T14:30:00Z',
  completedAt: null,
  dateCreated: '2024-12-20T09:00:00Z',
  items: [
    {
      id: 'item-1',
      productID: 'prod-1',
      productName: 'iPhone 14 Pro Max 256GB - Deep Purple',
      productImage: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
      unitPrice: 5500,
      quantity: 1,
    },
  ],
  store: {
    id: 'store-1',
    storeName: 'TechHub UG',
    storeSlug: 'techhub-ug',
    description: 'Premium tech gadgets for students',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    banner: null,
    email: 'tech@ug.edu.gh',
    phoneNumber: '+233 24 123 4567',
    status: 'active',
    isVerified: true,
    rating: 4.8,
    institutionID: 'inst-1',
    autoResponderEnabled: false,
    autoResponderName: null,
    dateCreated: '2024-01-01T00:00:00Z',
  },
  escrow: {
    id: 'escrow-1',
    orderID: 'order-1',
    amount: 5775,
    buyerFee: 275,
    sellerCommission: 288.75,
    platformFee: 288.75,
    sellerAmount: 5211.25,
    status: 'holding',
    holdUntil: '2024-12-29T14:30:00Z',
    releasedAt: null,
  },
};

const ORDER_TIMELINE: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Order Placed', description: 'Waiting for payment' },
  { status: 'paid', label: 'Payment Confirmed', description: 'Payment received securely' },
  { status: 'processing', label: 'Processing', description: 'Seller is preparing your order' },
  { status: 'shipped', label: 'Shipped', description: 'Order is on the way' },
  { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
  { status: 'completed', label: 'Completed', description: 'Order completed successfully' },
];

const getStatusStep = (status: OrderStatus): number => {
  const steps: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    completed: 5,
    cancelled: -1,
    refunded: -1,
    disputed: -1,
  };
  return steps[status] ?? 0;
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: order, isLoading } = useOrder(id!);
  const confirmDelivery = useConfirmDelivery();
  const cancelOrder = useCancelOrder();
  const requestRefund = useRequestRefund();

  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Use mock order for display
  const displayOrder = order || mockOrder;
  const currentStep = getStatusStep(displayOrder.status);
  const canConfirmDelivery = displayOrder.status === 'delivered';
  const canCancel = displayOrder.status === 'pending' || displayOrder.status === 'paid';
  const canRequestRefund = displayOrder.status === 'delivered' || displayOrder.status === 'completed';
  const canReview = displayOrder.status === 'completed';

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(displayOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDelivery = async () => {
    await confirmDelivery.mutateAsync(displayOrder.id);
  };

  const handleCancelOrder = async () => {
    await cancelOrder.mutateAsync(displayOrder.id);
    setShowCancelModal(false);
  };

  const handleRequestRefund = async () => {
    await requestRefund.mutateAsync({ orderId: displayOrder.id, reason: refundReason });
    setShowRefundModal(false);
    setRefundReason('');
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/orders');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'My Orders', href: '/orders' },
          { label: displayOrder.orderNumber },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Order {displayOrder.orderNumber}</h1>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-muted-foreground">
            Placed on {formatDate(displayOrder.dateCreated)}
          </p>
        </div>
        <Badge className={`${getOrderStatusColor(displayOrder.status)} text-base px-4 py-2`}>
          {displayOrder.status.charAt(0).toUpperCase() + displayOrder.status.slice(1)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          {displayOrder.status !== 'cancelled' && displayOrder.status !== 'refunded' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {ORDER_TIMELINE.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                        {/* Line */}
                        {index < ORDER_TIMELINE.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-[calc(100%-2rem)] ${
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                            }`}
                            style={{ transform: 'translateX(-50%)' }}
                          />
                        )}

                        {/* Dot */}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={isCurrent ? 'font-medium' : ''}>
                          <p className={isCompleted ? 'text-foreground' : 'text-muted-foreground'}>
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancelled/Refunded Notice */}
          {(displayOrder.status === 'cancelled' || displayOrder.status === 'refunded') && (
            <Alert variant={displayOrder.status === 'cancelled' ? 'default' : 'warning'}>
              <XCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">
                  Order {displayOrder.status === 'cancelled' ? 'Cancelled' : 'Refunded'}
                </p>
                <p className="text-sm">
                  {displayOrder.status === 'cancelled'
                    ? 'This order has been cancelled.'
                    : 'This order has been refunded.'}
                </p>
              </div>
            </Alert>
          )}

          {/* Confirm Delivery Banner */}
          {canConfirmDelivery && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Have you received your order?
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Confirm delivery to release payment to the seller
                </p>
              </div>
              <Button
                onClick={handleConfirmDelivery}
                disabled={confirmDelivery.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {confirmDelivery.isPending ? 'Confirming...' : 'Confirm Delivery'}
              </Button>
            </Alert>
          )}

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
                {displayOrder.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link to={item.productID ? `/products/${item.productID}` : '#'}>
                      <img
                        src={item.productImage || '/placeholder-product.jpg'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={item.productID ? `/products/${item.productID}` : '#'}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-medium mt-1">{formatPrice(item.unitPrice)}</p>
                    </div>
                    {canReview && (
                      <Link to={`/products/${item.productID}/review?orderId=${displayOrder.id}`}>
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {displayOrder.deliveryMethod === 'pickup' ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Campus Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        Arrange with seller for pickup location
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {displayOrder.deliveryAddress}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {displayOrder.deliveryNotes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-medium">Delivery Notes:</span>{' '}
                    {displayOrder.deliveryNotes}
                  </p>
                </div>
              )}

              {displayOrder.buyerNote && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-medium">Your Note:</span> {displayOrder.buyerNote}
                  </p>
                </div>
              )}

              {displayOrder.sellerNote && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">Seller Note:</span> {displayOrder.sellerNote}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(displayOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {displayOrder.deliveryFee > 0
                      ? formatPrice(displayOrder.deliveryFee)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatPrice(displayOrder.serviceFee)}</span>
                </div>
                {displayOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(displayOrder.discount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(displayOrder.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Info */}
          {displayOrder.escrow && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Shield className="h-5 w-5" />
                  Escrow Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Held</span>
                    <span className="font-medium">{formatPrice(displayOrder.escrow.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-green-600">
                      {displayOrder.escrow.status.charAt(0).toUpperCase() +
                        displayOrder.escrow.status.slice(1)}
                    </Badge>
                  </div>
                  {displayOrder.escrow.status === 'holding' && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Funds will be released after you confirm delivery or automatically
                      on {formatDate(displayOrder.escrow.holdUntil)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          {displayOrder.store && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Seller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {displayOrder.store.logo ? (
                    <img
                      src={displayOrder.store.logo}
                      alt={displayOrder.store.storeName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/stores/${displayOrder.store.storeSlug}`}
                      className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {displayOrder.store.storeName}
                      {displayOrder.store.isVerified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </Link>
                    {displayOrder.store.rating && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{displayOrder.store.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/messages?store=${displayOrder.store.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </Link>
                  <a href={`tel:${displayOrder.store.phoneNumber}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Link to="/orders">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>

              {canCancel && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}

              {canRequestRefund && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRefundModal(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request Refund
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Request Refund"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Please provide a reason for your refund request. Our team will review it within 24-48
            hours.
          </p>
          <Textarea
            placeholder="Describe the reason for your refund request..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestRefund}
              disabled={!refundReason.trim() || requestRefund.isPending}
            >
              {requestRefund.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
