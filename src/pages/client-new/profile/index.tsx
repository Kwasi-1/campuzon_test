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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

import { Laptop, Globe, Info } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useMyOrders } from "@/hooks";
import { useUserLocation, useMyActivities } from "@/hooks/useProfile";
import { api, extractData } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import type { User, UserActivity } from "@/types-new";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const getActivityDetails = (activity: UserActivity) => {
  switch (activity.action) {
    case "LOGIN":
      return {
        text: "Logged into your account",
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    case "OREDER_CREATED":
      return {
        text: activity.description || "Placed a new order",
        icon: ShoppingBag,
        color: "text-green-600",
        bg: "bg-green-50",
      };
    default:
      return {
        text: activity.description || activity.action,
        icon: Clock,
        color: "text-gray-600",
        bg: "bg-gray-50",
      };
  }
};


export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isResident, savedAddresses, displayLocation } = useUserLocation();
  const { data: activities, isLoading: activitiesLoading } = useMyActivities();
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  if (!user) return null;

  const stats = {
    totalOrders: orders?.length || 0,
    wishlistItems: 0,
    savedAddresses: isResident ? 1 : (savedAddresses?.length || 0),
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
        apiError.response?.data?.error?.message || "Failed to upload avatar",
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
      <Card className="rounded-3xl overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 mr-3">
              <AvatarImage src={user.profileImage} alt={user.displayName || user.firstName} />
              <AvatarFallback className="text-3xl">
                { user.firstName.charAt(0) + user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
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
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Manage your personal details and contact info
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="rounded-full"
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

              <div className="group rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors flex flex-col gap-4">
                {/* Institution Row */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      Institution
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.institutionName ||
                        user.institution?.name ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="h-px w-full bg-gray-100" />

                {/* Residence Row */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      Residence
                    </p>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayLocation || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-2xl border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
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
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="rounded-2xl border-gray-100 overflow-scroll shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-100 space-y-0">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Orders
            </CardTitle>
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
          </CardHeader>
          <CardContent className="p-0">
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
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="p-6 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activitiesLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !activities || activities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 font-medium">No recent activity found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.slice(0, 5).map((activity, index) => {
                  const details = getActivityDetails(activity);
                  return (
                      <div 
                        key={activity.id} 
                        onClick={() => setSelectedActivity(activity)}
                        className="flex gap-4 group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full ${details.bg} flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm`}>
                            <details.icon className={`h-5 w-5 ${details.color}`} />
                          </div>
                          {index !== Math.min(activities.length, 5) - 1 && (
                            <div className="w-px h-full bg-gray-100 absolute top-10 bottom-[-1.5rem]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-gray-900">{details.text}</p>
                            <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                              <p>
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(activity.dateCreated)}
                              </p>
                            {activity.ipAddress && (
                              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {activity.ipAddress}
                              </span>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {/* The Detail Side Panel */}
          <Sheet open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-xl">Activity Details</SheetTitle>
                <SheetDescription>
                  Technical logs for this specific action.
                </SheetDescription>
              </SheetHeader>

              {selectedActivity && (
                <div className="mt-8 space-y-6">
                  {/* Header Visual */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className={`h-12 w-12 rounded-full ${getActivityDetails(selectedActivity).bg} flex items-center justify-center`}>
                      {(() => {
                        const Icon = getActivityDetails(selectedActivity).icon;
                        return <Icon className={`h-6 w-6 ${getActivityDetails(selectedActivity).color}`} />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedActivity.action.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-500">{formatDate(selectedActivity.dateCreated)}</p>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="space-y-4">
                    <DetailRow 
                      icon={Globe} 
                      label="IP Address" 
                      value={selectedActivity.ipAddress || "Unknown"} 
                    />
                    <DetailRow 
                      icon={Laptop} 
                      label="Device/User Agent" 
                      value={selectedActivity.userAgent || "Unknown"} 
                      isLong
                    />
                    <DetailRow 
                      icon={Info} 
                      label="Description" 
                      value={selectedActivity.description || "No additional description provided."} 
                      isLong
                    />
                  </div>

                  <div className="pt-6">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl" 
                      onClick={() => setSelectedActivity(null)}
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, isLong }: { icon: any, label: string, value: string, isLong?: boolean }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <Icon className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
      <div className="space-y-1 overflow-hidden">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-gray-700 leading-relaxed ${isLong ? 'break-words' : 'font-mono'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
