
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, ExternalLink, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Notification, NotificationSettings } from '@/types-new';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotificationComponentProps {
  notifications: Notification[];
  settings?: NotificationSettings | null;
  isLoading: boolean;
  isSettingsLoading?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onUpdateSetting?: (key: keyof NotificationSettings, value: boolean) => void;
  onSaveSettings?: () => void;
  showSettings?: boolean;
  settingsTabCategories?: string[];
}

const NotificationComponent = ({
  notifications,
  settings,
  isLoading,
  isSettingsLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSetting,
  onSaveSettings,
  showSettings = false,
  settingsTabCategories = ['order', 'product', 'payment', 'system']
}: NotificationComponentProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filterByType = (type?: string) => {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  };

  const NotificationSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
    // Prevent triggering if clicked on inner buttons
    if ((e.target as HTMLElement).closest('.action-btn')) return;

    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    // Default routes based on type
    switch (notification.type) {
      case 'order':
      case 'payment':
        navigate('/admin-portal/transactions');
        break;
      case 'dispute':
        navigate('/admin-portal/disputes');
        break;
      case 'chat':
        navigate('/admin-portal/messages');
        break;
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card 
      onClick={(e) => handleNotificationClick(notification, e)}
      className={`cursor-pointer transition-colors hover:bg-gray-50/50 ${!notification.isRead ? 'border-2 border-primary/5 bg-accent/40 hover:bg-accent/60' : ''} shadow-none`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Bell className={`w-4 h-4 ${!notification.isRead ? 'text-primary' : 'text-gray-400'}`} />
              {notification.priority && (
                <Badge className={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
              )}
              <Badge className={getTypeColor(notification.type)}>
                {notification.type}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.dateCreated), { addSuffix: true })}
              </span>
            </div>
            
            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h3>
            
            <p className="text-sm text-gray-600">{notification.message}</p>
            
            {notification.actionUrl && (
              <Button variant="link" className="p-0 h-auto text-primary text-sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                {notification.actionLabel || 'View Details'}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="action-btn"
                onClick={() => onMarkAsRead(notification.id)}
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="action-btn"
              onClick={() => onDeleteNotification(notification.id)}
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyNotifications = ({ category }: { category?: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Bell className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {category ? `No ${category} notifications` : 'No notifications yet'}
        </h3>
        <p className="text-gray-600">
          {category 
            ? `You don't have any ${category} notifications at the moment.`
            : "When you have notifications, they'll appear here."
          }
        </p>
      </CardContent>
    </Card>
  );

  const SettingsTab = () => (
    <Card>
      <CardContent className="p-6 space-y-6">
        {settings && onUpdateSetting && (
          <>
            <div className="space-y-4">
              <h4 className="font-medium">Delivery Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => onUpdateSetting('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => onUpdateSetting('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => onUpdateSetting('smsNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Updates</Label>
                    <p className="text-sm text-gray-600">Updates about orders and deliveries</p>
                  </div>
                  <Switch
                    checked={settings.orderUpdates}
                    onCheckedChange={(checked) => onUpdateSetting('orderUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-600">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => onUpdateSetting('systemAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotional Updates</Label>
                    <p className="text-sm text-gray-600">Marketing and promotional content</p>
                  </div>
                  <Switch
                    checked={settings.promotions}
                    onCheckedChange={(checked) => onUpdateSetting('promotions', checked)}
                  />
                </div>
              </div>
            </div>

            {onSaveSettings && (
              <div className="flex justify-end">
                <Button onClick={onSaveSettings} disabled={isSettingsLoading}>
                  {isSettingsLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const tabTriggers = [
    { value: "all", label: `All (${notifications.length})` },
    ...settingsTabCategories.map(category => ({
      value: category,
      label: `${category.charAt(0).toUpperCase() + category.slice(1)} (${filterByType(category).length})`
    })),
    ...(showSettings ? [{ value: "settings", label: "Settings" }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={onMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full overflow-x-auto mb-4" style={{ gridTemplateColumns: `repeat(${tabTriggers.length}, minmax(0, 1fr))` }}>
          {tabTriggers.map((trigger) => (
            <TabsTrigger key={trigger.value} className="w-full text-xs sm:text-sm" value={trigger.value}>
              {trigger.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => <NotificationSkeleton key={i} />)
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        {settingsTabCategories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <NotificationSkeleton key={i} />)
            ) : filterByType(category).length === 0 ? (
              <EmptyNotifications category={category} />
            ) : (
              filterByType(category).map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        ))}

        {showSettings && (
          <TabsContent value="settings" className="space-y-4">
            <SettingsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default NotificationComponent;
