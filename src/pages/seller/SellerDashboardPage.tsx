import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Store,
  MessageCircle,
  Star,
  Users,
  Calendar,
  Search,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Breadcrumb,
} from '@/components/ui';
import { useAuthStore } from '@/stores';

// Mock data for dashboard
const mockStats = {
  totalSales: 125000,
  totalOrders: 342,
  totalProducts: 48,
  totalCustomers: 189,
  salesChange: 12.5,
  ordersChange: 8.2,
  productsChange: 5,
  customersChange: 15.3,
};

const mockRecentOrders = [
  {
    id: 'ORD-001',
    customer: 'Kwame Asante',
    product: 'iPhone 14 Pro Max',
    amount: 5500,
    status: 'pending',
    date: '2024-12-28T10:30:00Z',
  },
  {
    id: 'ORD-002',
    customer: 'Akosua Mensah',
    product: 'MacBook Air M2',
    amount: 8200,
    status: 'processing',
    date: '2024-12-28T09:15:00Z',
  },
  {
    id: 'ORD-003',
    customer: 'Kofi Owusu',
    product: 'AirPods Pro',
    amount: 850,
    status: 'completed',
    date: '2024-12-27T16:45:00Z',
  },
  {
    id: 'ORD-004',
    customer: 'Ama Darko',
    product: 'Samsung Galaxy S24',
    amount: 4200,
    status: 'completed',
    date: '2024-12-27T14:20:00Z',
  },
  {
    id: 'ORD-005',
    customer: 'Yaw Boateng',
    product: 'iPad Pro 12.9"',
    amount: 6800,
    status: 'cancelled',
    date: '2024-12-27T11:00:00Z',
  },
];

const mockTopProducts = [
  { id: '1', name: 'iPhone 14 Pro Max', sales: 45, revenue: 247500, stock: 12 },
  { id: '2', name: 'MacBook Air M2', sales: 28, revenue: 229600, stock: 8 },
  { id: '3', name: 'AirPods Pro', sales: 67, revenue: 56950, stock: 35 },
  { id: '4', name: 'Samsung Galaxy S24', sales: 32, revenue: 134400, stock: 15 },
  { id: '5', name: 'iPad Pro 12.9"', sales: 18, revenue: 122400, stock: 6 },
];

const mockRecentMessages = [
  { id: '1', customer: 'Kwame Asante', message: 'Is the iPhone still available?', time: '5 min ago', unread: true },
  { id: '2', customer: 'Akosua Mensah', message: 'When will my order arrive?', time: '1 hour ago', unread: true },
  { id: '3', customer: 'Kofi Owusu', message: 'Thank you for the quick delivery!', time: '3 hours ago', unread: false },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export function SellerDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user) {
    navigate('/login', { state: { from: '/seller/dashboard' } });
    return null;
  }

  if (!user.isOwner) {
    navigate('/');
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(mockStats.totalSales),
      change: mockStats.salesChange,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Total Orders',
      value: mockStats.totalOrders.toString(),
      change: mockStats.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Products',
      value: mockStats.totalProducts.toString(),
      change: mockStats.productsChange,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Customers',
      value: mockStats.totalCustomers.toString(),
      change: mockStats.customersChange,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Plus, path: '/seller/products/new', color: 'bg-primary text-white' },
    { label: 'View Orders', icon: ShoppingCart, path: '/seller/orders', color: 'bg-muted' },
    { label: 'Messages', icon: MessageCircle, path: '/seller/messages', color: 'bg-muted', badge: '3' },
    { label: 'Store Settings', icon: Store, path: '/seller/settings', color: 'bg-muted' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Seller Dashboard' },
        ]}
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your store today.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.change > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(stat.change)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className={`flex items-center gap-3 p-4 rounded-xl ${action.color} hover:opacity-90 transition-opacity`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{action.label}</span>
              {action.badge && (
                <Badge variant="secondary" className="ml-auto bg-primary text-white">
                  {action.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest customer orders</CardDescription>
              </div>
              <Link to="/seller/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-x-auto">
                {mockRecentOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors min-w-0"
                    >
                      <div className={`h-10 w-10 rounded-lg ${status.color} flex items-center justify-center shrink-0`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="font-medium truncate">{order.product}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.customer} • {formatDate(order.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                        <Badge className={`${status.color} text-xs`}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Customer inquiries</CardDescription>
              </div>
              <Link to="/seller/messages">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold shrink-0">
                      {msg.customer.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-medium truncate ${msg.unread ? '' : 'text-muted-foreground'}`}>
                          {msg.customer}
                        </p>
                        {msg.unread && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Link to="/seller/products">
                <Button variant="outline" size="sm">
                  Manage Products
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Sales</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopProducts.map((product, index) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{product.sales}</td>
                      <td className="text-right py-3 px-4 font-medium">{formatCurrency(product.revenue)}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                          {product.stock} left
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Store Performance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Store Rating</CardTitle>
              <CardDescription>Based on customer reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">4.8</div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400 fill-yellow-400/50'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Based on 156 reviews</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = rating === 5 ? 72 : rating === 4 ? 18 : rating === 3 ? 6 : rating === 2 ? 3 : 1;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Conversion Rate</p>
                      <p className="text-sm text-muted-foreground">Visitors who made a purchase</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">3.2%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Average Order Value</p>
                      <p className="text-sm text-muted-foreground">Per transaction</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(365)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Repeat Customers</p>
                      <p className="text-sm text-muted-foreground">Returning buyers</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">28%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
