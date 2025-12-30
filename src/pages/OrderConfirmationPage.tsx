import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  MessageCircle,
  ShoppingBag,
  Clock,
  Shield,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useCartStore } from '@/stores';
import { formatPrice, generateOrderNumber } from '@/lib/utils';

export function OrderConfirmationPage() {
  const { items } = useCartStore();
  const [orderNumber] = useState(() => generateOrderNumber());
  const [copied, setCopied] = useState(false);

  // In a real app, this would come from the order response
  const mockOrderDetails = {
    orderNumber,
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 1.05,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    estimatedDelivery: 'Within 1-3 days',
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Confetti animation dots
  const confettiColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative mb-8"
        >
          {/* Confetti */}
          {confettiColors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: [0, (i - 2) * 60],
                y: [0, -80, 20],
              }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}

          <div className="w-24 h-24 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. We've sent a confirmation to your email.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Order Number */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold font-mono">
                      {mockOrderDetails.orderNumber}
                    </span>
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
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <Package className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">{mockOrderDetails.itemCount}</p>
                  </div>
                  <div>
                    <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-medium text-sm">{mockOrderDetails.estimatedDelivery}</p>
                  </div>
                  <div>
                    <Shield className="h-5 w-5 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-green-600">Protected</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-primary">
                      {formatPrice(mockOrderDetails.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4">What happens next?</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Seller receives your order</p>
                    <p className="text-sm text-muted-foreground">
                      The seller will be notified and will prepare your items
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Payment held in escrow</p>
                    <p className="text-sm text-muted-foreground">
                      Your money is safe until you receive and approve your order
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Confirm delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Once you receive your items, confirm to release payment to seller
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/orders">
            <Button size="lg">
              <Package className="h-4 w-4 mr-2" />
              View My Orders
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="outline" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Seller
            </Button>
          </Link>
        </motion.div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
