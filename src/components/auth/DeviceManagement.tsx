import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  isCurrent: boolean;
  browser: string;
  os: string;
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      location: 'Accra, Ghana',
      lastActive: '2 minutes ago',
      isCurrent: true,
      browser: 'Chrome',
      os: 'macOS'
    },
    {
      id: '2',
      name: 'iPhone 14',
      type: 'mobile',
      location: 'Accra, Ghana',
      lastActive: '1 hour ago',
      isCurrent: false,
      browser: 'Safari',
      os: 'iOS'
    },
    {
      id: '3',
      name: 'Windows PC',
      type: 'desktop',
      location: 'Kumasi, Ghana',
      lastActive: '3 days ago',
      isCurrent: false,
      browser: 'Edge',
      os: 'Windows 11'
    }
  ]);

  const { toast } = useToast();

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      
      toast({
        title: "Device Removed",
        description: "The device has been successfully logged out and removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDevices(prev => prev.filter(device => device.isCurrent));
      
      toast({
        title: "All Devices Logged Out",
        description: "You have been logged out from all other devices.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout all devices. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Device Management</span>
            </CardTitle>
            <CardDescription>
              Manage devices that are signed into your account
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogoutAllDevices}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Remove devices you don't recognize to keep your account secure.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getDeviceIcon(device.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{device.name}</h4>
                    {device.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current Device
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {device.browser} on {device.os}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {device.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {device.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {!device.isCurrent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRemoveDevice(device.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Remove Device
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {devices.length === 1 && (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Only your current device is signed in.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceManagement;