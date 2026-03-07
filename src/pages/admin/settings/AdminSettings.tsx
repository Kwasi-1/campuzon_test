import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Download,
  Save,
  Plus,
} from "lucide-react";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import ChangePassword from "@/components/auth/ChangePassword";
import DeviceManagement from "@/components/auth/DeviceManagement";
import { useToast } from "@/hooks/use-toast";
import adminSettingsService, {
  AdminSettings,
  SystemInfo,
  BackupInfo,
} from "@/services/adminSettingsService";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsData, systemData, backupsData] = await Promise.all([
          adminSettingsService.getSettings(),
          adminSettingsService.getSystemInfo(),
          adminSettingsService.getBackups(),
        ]);
        setSettings(settingsData);
        setSystemInfo(systemData);
        setBackups(backupsData);
      } catch (error) {
        toast({
          title: "Failed to load settings",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleNotificationChange = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            notifications: { ...prev.notifications, [key]: value },
          }
        : null
    );
  };

  const handlePlatformSettingChange = (
    key: string,
    value: boolean | number
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            platform: { ...prev.platform, [key]: value },
          }
        : null
    );
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            security: { ...prev.security, [key]: value },
          }
        : null
    );
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await adminSettingsService.updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const backup = await adminSettingsService.createBackup(
        `Manual backup - ${new Date().toLocaleDateString()}`
      );
      setBackups((prev) => [backup, ...prev]);
      toast({
        title: "Backup created",
        description: "System backup has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to create backup",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleExportSettings = async () => {
    try {
      const blob = await adminSettingsService.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Settings exported",
        description: "Settings have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (loading || !settings) {
    return (
      <AdminPageLayout title="System Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="System Settings">
      <SEO
        title="Admin Settings"
        description="Manage system settings, configurations, and preferences"
        keywords="admin, settings, configuration, system"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure platform settings and system preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Configure core platform functionality and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the platform in maintenance mode
                      </p>
                    </div>
                    <Switch
                      checked={settings.platform.maintenanceMode}
                      onCheckedChange={(value) =>
                        handlePlatformSettingChange("maintenanceMode", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new user registrations
                      </p>
                    </div>
                    <Switch
                      checked={settings.platform.userRegistration}
                      onCheckedChange={(value) =>
                        handlePlatformSettingChange("userRegistration", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Store Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Require approval for new stores
                      </p>
                    </div>
                    <Switch
                      checked={settings.platform.storeApproval}
                      onCheckedChange={(value) =>
                        handlePlatformSettingChange("storeApproval", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Product Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new products
                      </p>
                    </div>
                    <Switch
                      checked={settings.platform.autoProductApproval}
                      onCheckedChange={(value) =>
                        handlePlatformSettingChange(
                          "autoProductApproval",
                          value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(value) =>
                        handleSecurityChange("twoFactorAuth", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all user sessions
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.sessionLogging}
                      onCheckedChange={(value) =>
                        handleSecurityChange("sessionLogging", value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChangePassword />
              <DeviceManagement />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive platform notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important alerts via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailAlerts}
                      onCheckedChange={(value) =>
                        handleNotificationChange("emailAlerts", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive critical alerts via SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsAlerts}
                      onCheckedChange={(value) =>
                        handleNotificationChange("smsAlerts", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(value) =>
                        handleNotificationChange("pushNotifications", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly analytics reports
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={(value) =>
                        handleNotificationChange("weeklyReports", value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  View system status and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">System Health</span>
                      <Badge
                        variant={
                          systemInfo.systemHealth === "healthy"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {systemInfo.systemHealth}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Version</span>
                      <p className="text-2xl font-bold">{systemInfo.version}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Uptime</span>
                      <p className="text-2xl font-bold">{systemInfo.uptime}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Database Size</span>
                      <p className="text-2xl font-bold">
                        {systemInfo.databaseSize}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Backups
                </CardTitle>
                <CardDescription>
                  Manage system backups and data recovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium">Available Backups</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage system backups
                    </p>
                  </div>
                  <Button onClick={handleCreateBackup}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{backup.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {backup.size} • Created{" "}
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              backup.type === "automatic"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {backup.type}
                          </Badge>
                          <Badge
                            variant={
                              backup.status === "completed"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {backup.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Restore
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
};

export default AdminSettingsPage;
