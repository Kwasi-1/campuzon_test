import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  EmptyState,
  Breadcrumb,
  OrderCardSkeleton,
} from '@/components/ui';
import { useMyOrders } from '@/hooks';
import { useAuthStore } from '@/stores';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return Clock;
    case 'paid':
    case 'processing':
      return Package;
    case 'shipped':
      return Truck;
    case 'delivered':
    case 'completed':
      return CheckCircle;
    case 'cancelled':
    case 'refunded':
      return XCircle;
    case 'disputed':
      return AlertCircle;
    default:
      return Package;
  }
};

// Mock orders for display
const mockOrders: Order[] = [
  {
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
    buyerNote: null,
    sellerNote: null,
    paidAt: '2024-12-20T10:00:00Z',
    shippedAt: '2024-12-21T10:00:00Z',
    deliveredAt: '2024-12-22T10:00:00Z',
    completedAt: null,
    dateCreated: '2024-12-20T09:00:00Z',
    items: [
      {
        id: 'item-1',
        productID: 'prod-1',
        productName: 'iPhone 14 Pro Max',
        productImage: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100&h=100&fit=crop',
        unitPrice: 5500,
        quantity: 1,
      },
    ],
    store: {
      id: 'store-1',
      storeName: 'TechHub UG',
      storeSlug: 'techhub-ug',
      description: null,
      logo: null,
      banner: null,
      email: 'tech@ug.edu.gh',
      phoneNumber: '+233240000000',
      status: 'active',
      isVerified: true,
      rating: 4.8,
      institutionID: 'inst-1',
      autoResponderEnabled: false,
      autoResponderName: null,
      dateCreated: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'order-2',
    orderNumber: 'CPZ-DEF456',
    userID: 'user-1',
    storeID: 'store-2',
    status: 'processing',
    deliveryMethod: 'delivery',
    subtotal: 850,
    deliveryFee: 15,
    serviceFee: 42.5,
    discount: 0,
    totalAmount: 907.5,
    deliveryAddress: 'Legon Hall, Room A101',
    deliveryNotes: 'Please call when arriving',
    buyerNote: null,
    sellerNote: null,
    paidAt: '2024-12-28T10:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    dateCreated: '2024-12-28T09:00:00Z',
    items: [
      {
        id: 'item-2',
        productID: 'prod-2',
        productName: 'AirPods Pro (2nd Gen)',
        productImage: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop',
        unitPrice: 850,
        quantity: 1,
      },
    ],
    store: {
      id: 'store-2',
      storeName: 'Campus Gadgets',
      storeSlug: 'campus-gadgets',
      description: null,
      logo: null,
      banner: null,
      email: 'gadgets@ug.edu.gh',
      phoneNumber: '+233240000001',
      status: 'active',
      isVerified: true,
      rating: 4.5,
      institutionID: 'inst-1',
      autoResponderEnabled: false,
      autoResponderName: null,
      dateCreated: '2024-02-01T00:00:00Z',
    },
  },
  {
    id: 'order-3',
    orderNumber: 'CPZ-GHI789',
    userID: 'user-1',
    storeID: 'store-1',
    status: 'pending',
    deliveryMethod: 'pickup',
    subtotal: 180,
    deliveryFee: 0,
    serviceFee: 9,
    discount: 0,
    totalAmount: 189,
    deliveryAddress: null,
    deliveryNotes: null,
    buyerNote: 'Urgent please',
    sellerNote: null,
    paidAt: null,
    shippedAt: null,
    deliveredAt: null,
    completedAt: null,
    dateCreated: '2024-12-29T08:00:00Z',
    items: [
      {
        id: 'item-3',
        productID: 'prod-3',
        productName: 'MacBook USB-C Charger',
        productImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop',
        unitPrice: 180,
        quantity: 1,
      },
    ],
  },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading } = useMyOrders();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use mock orders for display
  const displayOrders = orders || mockOrders;

  // Filter orders
  const filteredOrders = displayOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) {
    navigate('/login?redirect=/orders');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'My Orders' },
        ]}
        className="mb-6"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
            options={STATUS_OPTIONS}
          />
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
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title={searchQuery || statusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : "When you place orders, they'll appear here"
          }
          action={
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            const primaryItem = order.items?.[0];
            const otherItemsCount = (order.items?.length || 1) - 1;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={primaryItem?.productImage || '/placeholder-product.jpg'}
                          alt={primaryItem?.productName || 'Order item'}
                          className="w-full lg:w-24 h-40 lg:h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-medium text-sm text-muted-foreground">
                              {order.orderNumber}
                            </p>
                            <h3 className="font-semibold text-lg truncate">
                              {primaryItem?.productName}
                            </h3>
                            {otherItemsCount > 0 && (
                              <p className="text-sm text-muted-foreground">
                                +{otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <Badge className={getOrderStatusColor(order.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          {order.store && (
                            <div className="flex items-center gap-1">
                              <Store className="h-4 w-4" />
                              <span>{order.store.storeName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(order.dateCreated)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>
                              {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1} item
                              {(order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="font-bold text-lg">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <div className="flex gap-2">
                            {order.conversationID && (
                              <Link to={`/messages/${order.conversationID}`}>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              </Link>
                            )}
                            <Link to={`/orders/${order.id}`}>
                              <Button size="sm">
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
