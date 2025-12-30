import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Badge,
} from '@/components/ui';
import { useCartStore, useAuthStore } from '@/stores';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, storeName, updateQuantity, removeItem, clearCart } = useCartStore();

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-16 w-16" />}
          title="Your cart is empty"
          description="Looks like you haven't added any products yet. Start shopping to fill your cart!"
          action={
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {items.length} item{items.length > 1 ? 's' : ''} from{' '}
            <Link to={`/stores/${storeName}`} className="text-primary hover:underline">
              {storeName}
            </Link>
          </p>
        </div>
        <Button variant="ghost" onClick={clearCart} className="text-red-500">
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/products/${item.product.id}`}
                      className="shrink-0"
                    >
                      <img
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <Badge variant="outline" className="mt-1">
                        {item.product.category.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.quantity} available
                      </p>
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-lg">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.quantity}
                          className="p-2 hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee (5%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Protected by Escrow</span>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is held securely until you confirm delivery
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
