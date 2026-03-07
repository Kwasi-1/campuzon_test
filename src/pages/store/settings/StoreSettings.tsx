
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Store, Clock, MapPin, DollarSign, Bell, User, Mail, Phone, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';
import { StoreSettings as StoreSettingsType } from '@/types';
import { mockStoreSettings } from '@/data/mockData';
import ChangePassword from '@/components/auth/ChangePassword';
import DeviceManagement from '@/components/auth/DeviceManagement';

const StoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettings(mockStoreSettings);
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const handleInputChange = (field: keyof StoreSettingsType, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [field]: value
        }
      }
    }) : null);
  };

  const handleNotificationChange = (field: keyof StoreSettingsType['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }) : null);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Your store settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Store Settings</h1>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="hours">Hours</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <>
      <SEO 
        title="Store Settings"
        description="Configure your store settings, profile, and preferences."
        keywords="store settings, store profile, business configuration"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Store Settings</h1>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="w-5 h-5" />
                    <span>Store Information</span>
                  </CardTitle>
                  <CardDescription>
                    Basic information about your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      placeholder="Enter your store name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Store Description</Label>
                    <Textarea
                      id="description"
                      value={settings.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your store and what you offer"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Store Address</Label>
                    <Textarea
                      id="address"
                      value={settings.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your store's physical address"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Owner Information</span>
                  </CardTitle>
                  <CardDescription>
                    Contact information for the store owner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={settings.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="Enter owner's full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Opening Hours</span>
                </CardTitle>
                <CardDescription>
                  Set your store's operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daysOfWeek.map(({ key, label }) => {
                    const dayHours = settings.openingHours[key as keyof typeof settings.openingHours];
                    return (
                      <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium w-20">{label}</span>
                          {dayHours.closed ? (
                            <Badge variant="secondary">Closed</Badge>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={dayHours.open}
                                onChange={(e) => handleOpeningHoursChange(key, 'open', e.target.value)}
                                className="w-24"
                                disabled={dayHours.closed}
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={dayHours.close}
                                onChange={(e) => handleOpeningHoursChange(key, 'close', e.target.value)}
                                className="w-24"
                                disabled={dayHours.closed}
                              />
                            </div>
                          )}
                        </div>
                        <Switch
                          checked={!dayHours.closed}
                          onCheckedChange={(checked) => handleOpeningHoursChange(key, 'closed', !checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Business Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure pricing and delivery options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">Minimum Order (₵)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      value={settings.minimumOrder}
                      onChange={(e) => handleInputChange('minimumOrder', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Delivery Fee (₵)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={settings.deliveryFee}
                      onChange={(e) => handleInputChange('deliveryFee', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      value={settings.deliveryRadius}
                      onChange={(e) => handleInputChange('deliveryRadius', parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="e.g., GHS, USD, EUR"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newOrders">New Orders</Label>
                    <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                  </div>
                  <Switch
                    id="newOrders"
                    checked={settings.notifications.newOrders}
                    onCheckedChange={(checked) => handleNotificationChange('newOrders', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStock">Low Stock Alerts</Label>
                    <p className="text-sm text-gray-600">Get alerted when products are running low</p>
                  </div>
                  <Switch
                    id="lowStock"
                    checked={settings.notifications.lowStock}
                    onCheckedChange={(checked) => handleNotificationChange('lowStock', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotions">Promotional Updates</Label>
                    <p className="text-sm text-gray-600">Receive updates about promotions and offers</p>
                  </div>
                  <Switch
                    id="promotions"
                    checked={settings.notifications.promotions}
                    onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChangePassword />
              <DeviceManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StoreSettings;
