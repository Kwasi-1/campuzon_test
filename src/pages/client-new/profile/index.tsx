import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User as UserIcon,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import { Alert } from "@/components/ui/alert";
import Input from "@/components/shared/InputField";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores";
import { useMyOrders } from "@/hooks";
import { api, extractData } from "@/lib/api";
import { mockInstitutions } from "@/lib/mockData";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import type { User } from "@/types-new";

// Mock data for stats
const mockStats = {
  totalOrders: 12,
  wishlistItems: 8,
  savedAddresses: 2,
  totalSpent: 4580,
};

const mockRecentActivity = [
  { type: "order", text: "Welcome to Campuzon!", time: "Recently" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate("/login", { state: { from: "/profile" } });
    return null;
  }

  const institution = mockInstitutions.find((i) => i.id === user.institutionID);

  const stats = {
    totalOrders: orders?.length || 0,
    wishlistItems: 0, // Should use useWishlist hook in real app
    savedAddresses: 0,
    totalSpent:
      orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
  };

  const recentOrders = orders?.slice(0, 3) || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAvatarLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.post("/user/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = extractData<{ user: User }>(response);
      useAuthStore.getState().setUser(data.user);
      setSuccess("Avatar updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to upload avatar");
    } finally {
      setIsAvatarLoading(false);
    }
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
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || "",
    });
    setIsEditing(false);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "orders", label: "My Orders", icon: Package, path: "/orders" },
    { id: "wishlist", label: "Wishlist", icon: Heart, path: "/wishlist" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      path: "/messages",
      badge: "3",
    },
    { id: "addresses", label: "Addresses", icon: MapPin, path: "/addresses" },
    {
      id: "payments",
      label: "Payment Methods",
      icon: CreditCard,
      path: "/payments",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      path: "/settings/security",
    },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  // Add store management for store owners
  if (user.isOwner) {
    sidebarItems.unshift({
      id: "store",
      label: "Seller Dashboard",
      icon: Store,
      path: "/seller/dashboard",
    });
  }

  const statsCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Wishlist Items",
      value: stats.wishlistItems,
      icon: Heart,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Saved Addresses",
      value: stats.savedAddresses,
      icon: MapPin,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Spent",
      value: formatPrice(stats.totalSpent),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const statusColors: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.displayName || user.firstName}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center border-2 border-gray-200">
                      <span className="text-2xl font-bold text-white">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isAvatarLoading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  <label
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors border-2 border-white cursor-pointer"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isAvatarLoading}
                    />
                  </label>
                </div>

                {/* Name & Verification */}
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                  {user.isOwner && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-50 text-amber-700 border border-amber-200"
                    >
                      <Store className="h-3 w-3 mr-1" />
                      Seller
                    </Badge>
                  )}
                  {user.twoFactorEnabled && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border border-green-200"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      2FA
                    </Badge>
                  )}
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Member since{" "}
                  {new Date(user.dateCreated).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Navigation Menu - Desktop */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200">
              <nav className="py-1">
                {sidebarItems.map((item) => {
                  const isActive = !item.path;
                  const isLink = item.path;

                  const content = (
                    <div
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-l-[3px] ${
                        isActive
                          ? "border-l-primary bg-blue-50/60 text-primary font-semibold"
                          : "border-l-transparent hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {item.badge}
                        </span>
                      )}
                      {isLink && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
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

                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-colors border-l-[3px] border-l-transparent"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    <span className="text-sm font-medium">Sign out</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
              {sidebarItems.map((item, index) => {
                const isLink = item.path;

                const content = (
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                      index !== sidebarItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 text-gray-500" />
                    <span className="flex-1 text-sm font-medium text-gray-800">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
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
            </div>

            {/* Logout - Mobile */}
            <button
              onClick={handleLogout}
              className="w-full lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-white text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>

          {/* Main Content Area */}
          <div className="space-y-5">
            {/* Alerts */}
            {error && <Alert variant="destructive">{error}</Alert>}
            {success && (
              <Alert variant="default" className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{success}</span>
              </Alert>
            )}

            {/* Profile Details */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Personal information
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Manage your personal details
                  </p>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full"
                  >
                    <Edit2 className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEditSubmit}
                      disabled={isLoading}
                      className="rounded-full"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-5">
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                      label="First Name"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      leftIcon={<UserIcon className="h-4 w-4" />}
                    />
                    <Input
                      label="Last Name"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      leftIcon={<UserIcon className="h-4 w-4" />}
                    />
                    <Input
                      label="Phone Number"
                      value={editForm.phoneNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      leftIcon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>
                      {user.emailVerified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border border-green-200 shrink-0 text-xs"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      {user.phoneVerified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border border-green-200 shrink-0 text-xs"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Institution
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {institution?.name || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {statsCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders & Activity */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Recent Orders
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Your latest purchases
                    </p>
                  </div>
                  <Link to="/orders">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-sm font-medium"
                    >
                      See all
                      <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Button>
                  </Link>
                </div>
                <div>
                  {ordersLoading ? (
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        No orders yet
                      </p>
                    </div>
                  ) : (
                    recentOrders.map((order, index) => (
                      <div
                        key={order.id}
                        className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                          index !== recentOrders.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.items?.[0]?.productName || "Order Item"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.orderNumber} ·{" "}
                            {formatDate(order.dateCreated)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded-full capitalize ${getOrderStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-900">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Your latest actions
                  </p>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Link to="/products">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link to="/wishlist">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-sm"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      View Wishlist
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Link to="/settings/security">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-sm"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
