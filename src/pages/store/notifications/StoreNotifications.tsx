import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import { Notification } from '@/types';
import NotificationComponent from '@/components/shared/NotificationComponent';
import storeService, { StoreNotification } from '@/services/storeService';
import { toast } from 'sonner';

const StoreNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast: toastHook } = useToast();

  const itemsPerPage = 15;

  // Fetch notifications from API
  const fetchNotifications = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await storeService.getNotifications(page, itemsPerPage);
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedNotifications: Notification[] = response.data.map((notif: StoreNotification) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          timestamp: notif.timestamp,
          read: notif.read,
          actionUrl: notif.actionUrl,
          actionLabel: notif.actionLabel,
          priority: notif.priority,
          category: notif.category
        }));

        setNotifications(transformedNotifications);
        
        // Handle pagination from response headers or metadata
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage]);

  const markAsRead = async (id: string) => {
    if (isUpdating) return;
    
    setIsUpdating(id);
    try {
      await storeService.markNotificationAsRead(id);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      toast.success("Notification marked as read");
    } catch (error: any) {
      toast.error(error.message || "Failed to update notification");
    } finally {
      setIsUpdating(null);
    }
  };

  const markAllAsRead = async () => {
    if (isUpdating) return;
    
    setIsUpdating('all');
    try {
      await storeService.markAllNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error.message || "Failed to update notifications");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteNotification = async (id: string) => {
    if (isUpdating) return;
    
    setIsUpdating(id);
    try {
      await storeService.deleteNotification(id);
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notification");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <>
      <SEO 
        title="Notifications"
        description="View and manage your store notifications"
        keywords="notifications, alerts, store updates"
      />
      
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Notifications</h1>
        </div>

        <NotificationComponent
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          settingsTabCategories={['order', 'product', 'payment', 'system']}
        />
      </div>
    </>
  );
};

export default StoreNotifications;