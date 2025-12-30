import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  EmptyState,
  Breadcrumb,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Order Delivered',
    message: 'Your order CPZ-ABC123 has been delivered. Please confirm receipt to release payment to the seller.',
    type: 'order',
    referenceType: 'order',
    referenceID: 'order-1',
    isRead: false,
    dateCreated: '2024-12-29T10:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'New Message',
    message: 'TechHub UG sent you a message about your order.',
    type: 'chat',
    referenceType: 'conversation',
    referenceID: 'conv-1',
    isRead: false,
    dateCreated: '2024-12-29T09:30:00Z',
  },
  {
    id: 'notif-3',
    title: 'Payment Successful',
    message: 'Your payment of GHS 5,775.00 for order CPZ-ABC123 was successful.',
    type: 'payment',
    referenceType: 'order',
    referenceID: 'order-1',
    isRead: true,
    dateCreated: '2024-12-28T14:00:00Z',
  },
  {
    id: 'notif-4',
    title: 'Price Drop Alert',
    message: 'AirPods Pro you saved is now 10% off! Limited time offer.',
    type: 'promo',
    referenceType: 'product',
    referenceID: 'prod-2',
    isRead: true,
    dateCreated: '2024-12-27T10:00:00Z',
  },
  {
    id: 'notif-5',
    title: 'Order Confirmed',
    message: 'Your order CPZ-DEF456 has been confirmed and is being processed.',
    type: 'order',
    referenceType: 'order',
    referenceID: 'order-2',
    isRead: true,
    dateCreated: '2024-12-26T15:00:00Z',
  },
  {
    id: 'notif-6',
    title: 'Welcome to Campuzon!',
    message: 'Thank you for joining our campus marketplace. Start exploring products now!',
    type: 'system',
    referenceType: null,
    referenceID: null,
    isRead: true,
    dateCreated: '2024-12-20T09:00:00Z',
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return Package;
    case 'chat':
      return MessageCircle;
    case 'payment':
      return CreditCard;
    case 'dispute':
      return AlertCircle;
    case 'promo':
      return Tag;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'chat':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'payment':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'dispute':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'promo':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  if (!notification.referenceType || !notification.referenceID) return null;

  switch (notification.referenceType) {
    case 'order':
      return `/orders/${notification.referenceID}`;
    case 'conversation':
      return `/messages/${notification.referenceID}`;
    case 'product':
      return `/products/${notification.referenceID}`;
    default:
      return null;
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter((n) => !n.isRead);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
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
    navigate('/login?redirect=/notifications');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Notifications' },
        ]}
        className="mb-6"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}

          <Link to="/settings/notifications">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-16 w-16" />}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            filter === 'unread'
              ? "You've read all your notifications"
              : "You'll receive notifications about orders, messages, and updates here"
          }
          action={
            filter === 'unread' ? (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View All
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
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
                <Card
                  className={`hover:shadow-md transition-all ${
                    !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`font-medium ${
                                !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(notification.dateCreated)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {link && (
                            <Link to={link}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          )}
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-red-500"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Clear All */}
          {notifications.length > 0 && (
            <div className="text-center pt-4">
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
