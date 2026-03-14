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
  ChevronRight,
  Camera,
  Edit2,
  Check,
  X,
  Loader2,
  BadgeCheck,
  Calendar,
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

// Mock data for stats and activity
const mockRecentActivity = [
  { type: "order", text: "Welcome to Campuzon!", time: "Recently" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
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

  if (!user) return null;

  const institution = mockInstitutions.find((i) => i.id === user.institutionID);

  const stats = {
    totalOrders: orders?.length || 0,
    wishlistItems: 0,
    savedAddresses: 0,
    totalSpent:
      orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
  };

  const recentOrders = orders?.slice(0, 3) || [];

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
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      setError(
        apiError.response?.data?.error?.message || "Failed to upload avatar"
      );
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

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-700">{success}</span>
        </Alert>
      )}

      {/* Profile Header & Picture update */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.displayName || user.firstName}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-sm">
                <span className="text-3xl font-bold text-white">
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
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors border-2 border-white cursor-pointer shadow-sm"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isAvatarLoading}
              />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              {user.isVerified && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            <p className="text-base text-gray-500 mb-3">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {user.isOwner && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  Seller Account
                </Badge>
              )}
              {user.twoFactorEnabled && (
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border border-green-200"
                >
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  2FA Active
                </Badge>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-400 sm:ml-auto mt-2 sm:mt-0">
                <Calendar className="h-4 w-4" />
                Joined{" "}
                {new Date(user.dateCreated).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Edit */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage your personal details and contact info
              </p>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="rounded-full shadow-sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="rounded-full shadow-sm"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={isLoading}
                  className="rounded-full shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="First Name"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
                leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
                className="bg-white"
              />
              <Input
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
                leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
                className="bg-white"
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
                leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                className="bg-white"
              />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      Email Address
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.emailVerified && (
                    <BadgeCheck className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                </div>
              </div>

              <div className="group rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      Phone Number
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.phoneNumber || "Not provided"}
                    </p>
                  </div>
                  {user.phoneVerified && (
                    <BadgeCheck className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                </div>
              </div>

              <div className="group rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      Institution
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {institution?.name || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-0.5">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
            </div>
            <Link to="/orders">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-sm font-medium hover:bg-blue-50 rounded-full"
              >
                View all orders
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div>
            {ordersLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No recent orders found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {order.items?.[0]?.productName || "Multiple Items"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Order #{order.orderNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {mockRecentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary mt-1.5 shadow-sm" />
                    {index !== mockRecentActivity.length - 1 && (
                      <div className="w-px h-full bg-gray-100 absolute top-4 bottom-[-1.5rem]" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
