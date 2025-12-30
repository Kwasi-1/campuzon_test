import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Store,
  Package,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight,
  Camera,
  Edit2,
  Check,
  X,
  Loader2,
  BadgeCheck,
  Calendar,
  CreditCard,
  Bell,
  MapPin,
  Clock,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Alert,
  Breadcrumb,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { mockInstitutions } from '@/lib/mockData';

// Mock data for stats
const mockStats = {
  totalOrders: 12,
  wishlistItems: 8,
  savedAddresses: 2,
  totalSpent: 4580,
};

const mockRecentOrders = [
  { id: 'ORD-001', product: 'iPhone 14 Pro', date: '2024-12-25', status: 'delivered', amount: 5500 },
  { id: 'ORD-002', product: 'AirPods Pro', date: '2024-12-20', status: 'delivered', amount: 850 },
  { id: 'ORD-003', product: 'MacBook Charger', date: '2024-12-15', status: 'delivered', amount: 180 },
];

const mockRecentActivity = [
  { type: 'order', text: 'Order ORD-001 delivered', time: '2 days ago' },
  { type: 'wishlist', text: 'Added Samsung Galaxy S24 to wishlist', time: '3 days ago' },
  { type: 'review', text: 'Left a review for iPhone 14 Pro', time: '4 days ago' },
  { type: 'order', text: 'Order ORD-002 delivered', time: '1 week ago' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }

  const institution = mockInstitutions.find(i => i.id === user.institutionID);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        displayName: `${editForm.firstName} ${editForm.lastName.charAt(0)}.`,
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', badge: '3' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/addresses' },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard, path: '/payments' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'security', label: 'Security', icon: Shield, path: '/settings/security' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Add store management for store owners
  if (user.isOwner) {
    sidebarItems.unshift({
      id: 'store',
      label: 'Seller Dashboard',
      icon: Store,
      path: '/seller/dashboard',
    });
  }

  const statsCards = [
    { label: 'Total Orders', value: mockStats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Wishlist Items', value: mockStats.wishlistItems, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    { label: 'Saved Addresses', value: mockStats.savedAddresses, icon: MapPin, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Spent', value: formatCurrency(mockStats.totalSpent), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  const statusColors: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile' },
        ]}
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-4"
      >
        {/* Left Sidebar - Profile Card & Navigation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.displayName || user.firstName}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-background shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-4 ring-background shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <button
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Name & Verification */}
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.isVerified && (
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {user.isOwner && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Store className="h-3 w-3 mr-1" />
                      Seller
                    </Badge>
                  )}
                  {user.twoFactorEnabled && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Shield className="h-3 w-3 mr-1" />
                      2FA
                    </Badge>
                  )}
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Member since {new Date(user.dateCreated).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Menu - Desktop */}
          <Card className="hidden lg:block">
            <CardContent className="p-2">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                const isLink = item.path;
                
                const content = (
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                    onClick={!isLink ? () => setActiveTab(item.id as 'overview' | 'orders' | 'settings') : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1 font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className={`${isActive ? 'bg-white/20 text-white' : ''}`}>
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                );

                return isLink ? (
                  <Link key={item.id} to={item.path!}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })}

              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Menu */}
          <Card className="lg:hidden">
            <CardContent className="p-0">
              {sidebarItems.map((item, index) => {
                const isLink = item.path;
                
                const content = (
                  <div
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      index !== sidebarItems.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary">{item.badge}</Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                );

                return isLink ? (
                  <Link key={item.id} to={item.path!}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })}
            </CardContent>
          </Card>

          {/* Logout - Mobile */}
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 lg:hidden"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content Area - Desktop */}
        <div className="lg:col-span-3 space-y-6">
          {/* Alerts */}
          {error && (
            <Alert variant="destructive">{error}</Alert>
          )}
          {success && (
            <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400">{success}</span>
            </Alert>
          )}

          {/* Profile Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleEditSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="First Name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Last Name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Phone Number"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    {user.emailVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    {user.phoneVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Institution</p>
                      <p className="font-medium">{institution?.name || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders & Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </div>
                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{order.product}</p>
                        <p className="text-sm text-muted-foreground">{order.id} • {order.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{formatCurrency(order.amount)}</p>
                        <Badge className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/products">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    View Wishlist
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link to="/settings/security">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
