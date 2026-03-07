import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Notification, NotificationSettings } from "@/types";
import adminNotificationsService, {
  NotificationTemplate,
  BroadcastNotification,
} from "@/services/adminNotificationsService";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import NotificationComponent from "@/components/shared/NotificationComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, FileText, BarChart3 } from "lucide-react";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [broadcastHistory, setBroadcastHistory] = useState<
    BroadcastNotification[]
  >([]);
  const [notificationStats, setNotificationStats] = useState<{
    totalSent: number;
    totalDelivered: number;
    deliveryRate: number;
    engagementRate: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "info" as const,
    recipients: "all" as const,
  });
  const { toast } = useToast();

  const { admin } = useAdminAuth();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [notificationsList, templatesData, broadcastData, statsData] =
          await Promise.all([
            adminNotificationsService.list(admin?.id),
            adminNotificationsService.getTemplates(),
            adminNotificationsService.getBroadcastHistory(),
            adminNotificationsService.getNotificationStats(),
          ]);

        setNotifications(notificationsList);
        setTemplates(templatesData);
        setBroadcastHistory(broadcastData);
        setNotificationStats(statsData);

        const s =
          adminNotificationsService.getSettings() ||
          ({
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            orderUpdates: true,
            promotions: false,
            systemAlerts: true,
            lowStockAlerts: true,
            newUserRegistrations: true,
          } as NotificationSettings);
        setSettings(s);
      } catch (e) {
        toast({
          title: "Failed to load data",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [admin, toast]);

  const markAsRead = async (id: string) => {
    try {
      await adminNotificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast({
        title: "Notification marked as read",
        description: "The notification has been updated.",
      });
    } catch (e) {
      toast({
        title: "Failed to update notification",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminNotificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been updated.",
      });
    } catch (e) {
      toast({
        title: "Failed to mark all as read",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSettingsLoading(true);
    try {
      await adminNotificationsService.updateServerSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (e) {
      toast({
        title: "Failed to save settings",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const sendBroadcast = async () => {
    try {
      if (!broadcastForm.title || !broadcastForm.message) {
        toast({
          title: "Missing Information",
          description: "Please fill in both title and message.",
          variant: "destructive",
        });
        return;
      }

      const broadcast = await adminNotificationsService.createBroadcast(
        broadcastForm
      );
      setBroadcastHistory((prev) => [broadcast, ...prev]);
      setBroadcastForm({
        title: "",
        message: "",
        type: "info",
        recipients: "all",
      });

      toast({
        title: "Broadcast Sent",
        description: `Notification sent to ${broadcastForm.recipients}.`,
      });
    } catch (e) {
      toast({
        title: "Failed to send broadcast",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPageLayout title="Notification Management">
      <SEO
        title="Admin Notifications"
        description="Manage system notifications, broadcasts, and preferences"
        keywords="admin, notifications, alerts, system, broadcast"
      />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationComponent
            notifications={notifications}
            settings={settings}
            isLoading={isLoading}
            isSettingsLoading={isSettingsLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onUpdateSetting={updateSetting}
            onSaveSettings={saveSettings}
            showSettings={false}
            settingsTabCategories={["user", "system", "payment"]}
          />
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Broadcast Notification
              </CardTitle>
              <CardDescription>
                Send notifications to all users, customers, stores, or riders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <Select
                    value={broadcastForm.recipients}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        recipients: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="stores">Store Owners</SelectItem>
                      <SelectItem value="riders">Delivery Riders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={broadcastForm.type}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        type: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter notification title"
                  value={broadcastForm.title}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter notification message"
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
              <Button onClick={sendBroadcast} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Broadcast History</CardTitle>
              <CardDescription>
                Recent broadcast notifications sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {broadcastHistory.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{broadcast.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {broadcast.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            broadcast.type === "warning"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {broadcast.type}
                        </Badge>
                        <Badge variant="outline">{broadcast.recipients}</Badge>
                        <Badge
                          variant={
                            broadcast.status === "sent"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {broadcast.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {broadcast.sentAt
                        ? new Date(broadcast.sentAt).toLocaleDateString()
                        : "Not sent"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notification Templates
              </CardTitle>
              <CardDescription>
                Manage reusable notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{template.type}</Badge>
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge
                          variant={template.isActive ? "default" : "secondary"}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sent
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notificationStats?.totalSent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Notifications sent this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notificationStats?.totalDelivered || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully delivered
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Delivery Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notificationStats?.deliveryRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average delivery success
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notificationStats?.engagementRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  User engagement rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <NotificationComponent
            notifications={[]}
            settings={settings}
            isLoading={false}
            isSettingsLoading={isSettingsLoading}
            onMarkAsRead={() => {}}
            onMarkAllAsRead={() => {}}
            onDeleteNotification={() => {}}
            onUpdateSetting={updateSetting}
            onSaveSettings={saveSettings}
            showSettings={true}
            settingsTabCategories={["user", "system", "payment"]}
          />
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default AdminNotifications;
