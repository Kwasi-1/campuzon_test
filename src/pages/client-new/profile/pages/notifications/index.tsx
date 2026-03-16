import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Package,
  MessageCircle,
  CreditCard,
  AlertCircle,
  Tag,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types-new";

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Order Delivered",
    message:
      "Your order CPZ-ABC123 has been delivered. Please confirm receipt to release payment to the seller.",
    type: "order",
    referenceType: "order",
    referenceID: "order-1",
    isRead: false,
    dateCreated: "2024-12-29T10:00:00Z",
  },
  {
    id: "notif-2",
    title: "New Message",
    message: "TechHub UG sent you a message about your order.",
    type: "chat",
    referenceType: "conversation",
    referenceID: "conv-1",
    isRead: false,
    dateCreated: "2024-12-29T09:30:00Z",
  },
  {
    id: "notif-3",
    title: "Payment Successful",
    message:
      "Your payment of GHS 5,775.00 for order CPZ-ABC123 was successful.",
    type: "payment",
    referenceType: "order",
    referenceID: "order-1",
    isRead: true,
    dateCreated: "2024-12-28T14:00:00Z",
  },
  {
    id: "notif-4",
    title: "Price Drop Alert",
    message: "AirPods Pro you saved is now 10% off! Limited time offer.",
    type: "promo",
    referenceType: "product",
    referenceID: "prod-2",
    isRead: true,
    dateCreated: "2024-12-27T10:00:00Z",
  },
  {
    id: "notif-5",
    title: "Order Confirmed",
    message: "Your order CPZ-DEF456 has been confirmed and is being processed.",
    type: "order",
    referenceType: "order",
    referenceID: "order-2",
    isRead: true,
    dateCreated: "2024-12-26T15:00:00Z",
  },
  {
    id: "notif-6",
    title: "Welcome to Campuzon!",
    message:
      "Thank you for joining our campus marketplace. Start exploring products now!",
    type: "system",
    referenceType: null,
    referenceID: null,
    isRead: true,
    dateCreated: "2024-12-20T09:00:00Z",
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "order":
      return Package;
    case "chat":
      return MessageCircle;
    case "payment":
      return CreditCard;
    case "dispute":
      return AlertCircle;
    case "promo":
      return Tag;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "order":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "chat":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case "payment":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    case "dispute":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "promo":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  if (!notification.referenceType || !notification.referenceID) return null;

  switch (notification.referenceType) {
    case "order":
      return `/orders/${notification.referenceID}`;
    case "conversation":
      return `/messages/${notification.referenceID}`;
    case "product":
      return `/products/${notification.referenceID}`;
    default:
      return null;
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications.filter((n) => n.isRead);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/notifications");
    return null;
  }

  const readCount = notifications.length - unreadCount;

  const sidebarCategories: {
    key: "all" | "unread" | "read";
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All Notifications", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: readCount },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Link to="/settings/notifications">
            <Button variant="ghost" size="sm" className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-col xl:flex-row gap-8 pb-12">
        {/* Sidebar Filters */}
        <div className="xl:w-64 shrink-0">
          <div className="flex xl:flex-col gap-3 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 scrollbar-hide xl:sticky xl:top-24">
            {sidebarCategories.map((cat) => {
              const isActive = filter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFilter(cat.key)}
                  className={`flex items-center justify-between pl-5 pr-[2px] py-[3px] xl:py-1 xl:pr-1 rounded-full transition-all shrink-0 xl:shrink-auto whitespace-nowrap xl:whitespace-normal border shadow-sm ${
                    isActive
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-[15px]">{cat.label}</span>
                  <span
                    className={`h-10 w-10 xl:w-12 xl:h-12 ml-3 flex items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1">
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-16 w-16" />}
              title={
                filter !== "all"
                  ? `No ${filter} notifications`
                  : "No notifications"
              }
              description={
                filter === "unread"
                  ? "You've read all your notifications"
                  : filter === "read"
                    ? "You haven't read any notifications yet"
                    : "You'll receive notifications about orders, messages, and updates here"
              }
              action={
                filter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => setFilter("all")}
                    className="rounded-full"
                  >
                    View All
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const link = getNotificationLink(notification);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div
                      className={`bg-white border rounded-[24px] overflow-hidden shadow-sm transition-all ${
                        !notification.isRead
                          ? "border-[#1C1C1E]/25 ring-1 ring-[#1C1C1E]/10"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="p-5 md:p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                              notification.type,
                            )}`}
                          >
                            <Icon className="h-5 w-5" strokeWidth={2} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span className="whitespace-nowrap">
                                  {formatRelativeTime(notification.dateCreated)}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-[#1C1C1E]" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 md:px-6 py-3 border-t border-gray-100 bg-[#F7F7F8] flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          {link && (
                            <Link to={link}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-gray-200"
                              >
                                View
                              </Button>
                            </Link>
                          )}
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-full"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(notification.id)}
                          aria-label={`Delete ${notification.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Clear All */}
              {notifications.length > 0 && (
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-gray-500 hover:text-red-500"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All Notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
