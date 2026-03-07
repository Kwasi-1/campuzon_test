import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Shield, Bell, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import ChangePassword from '@/components/auth/ChangePassword';
import DeviceManagement from '@/components/auth/DeviceManagement';
import { Address } from '@/types';
import { authService } from '@/services';

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile state - get data from signup or stored user data
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    region: user?.region || ''
  });

  // Addresses state - use user's signup data for default address
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const defaultAddresses: Address[] = [];
    
    // Create default address from user's signup data if available
    if (user?.address && user?.city && user?.region) {
      const userAddress = `${user.address}, ${user.city}, ${user.region} Region`;
      defaultAddresses.push({
        id: '1',
        label: 'Home',
        address: userAddress,
        phone: user.phone || '+233 20 123 4567',
        isDefault: true
      });
    } 
    
    // Add additional example address
    defaultAddresses.push({
      id: '2',
      label: 'Office',
      address: '456 Ring Road Central, Adabraka, Accra, Greater Accra Region',
      phone: '+233 24 567 8901'
    });
    
    return defaultAddresses;
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotionalOffers: true,
    newProductAlerts: false,
    dataSharing: true,
    marketingCommunications: false
  });

  // Dialog states
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    phone: ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    }, 500);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    }, 500);
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address || !newAddress.phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress
    };

    setAddresses([...addresses, address]);
    setNewAddress({ label: '', address: '', phone: '' });
    setIsAddressDialogOpen(false);
    
    toast({
      title: "Address Added",
      description: "New address has been added successfully.",
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      address: address.address,
      phone: address.phone
    });
    setIsAddressDialogOpen(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress || !newAddress.label || !newAddress.address || !newAddress.phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setAddresses(addresses.map(addr => 
      addr.id === editingAddress.id 
        ? { ...addr, ...newAddress }
        : addr
    ));

    setEditingAddress(null);
    setNewAddress({ label: '', address: '', phone: '' });
    setIsAddressDialogOpen(false);
    
    toast({
      title: "Address Updated",
      description: "Address has been updated successfully.",
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast({
      title: "Address Deleted",
      description: "Address has been removed successfully.",
    });
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setNewAddress({ label: '', address: '', phone: '' });
  };

  // Security (2FA) state
  const [securityLoading, setSecurityLoading] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [pendingToggle, setPendingToggle] = useState<'enable' | 'disable' | null>(null);

  // Load 2FA status on mount
  useEffect(() => {
    const loadSecurity = async () => {
      try {
        setSecurityLoading(true);
        const info = await authService.getSecurityInfo();
        setTwoFactorEnabled(Boolean(info?.two_factor_enabled));
      } catch (e) {
        // ignore for now; page still usable
      } finally {
        setSecurityLoading(false);
      }
    };
    loadSecurity();
  }, []);

  const requestToggle2FA = (target: 'enable' | 'disable') => {
    setPendingToggle(target);
    setPasswordInput('');
    setShowPasswordDialog(true);
  };

  const confirmToggle2FA = async () => {
    if (!pendingToggle) return;
    try {
      setSecurityLoading(true);
      if (pendingToggle === 'enable') {
        const codes = await authService.enableTwoFactor(passwordInput);
        setTwoFactorEnabled(true);
        toast({
          title: 'Two-Factor Enabled',
          description: `Save these recovery codes securely: ${codes.join(', ')}`,
        });
      } else {
        await authService.disableTwoFactor(passwordInput);
        setTwoFactorEnabled(false);
        toast({ title: 'Two-Factor Disabled', description: 'You have disabled 2FA.' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update 2FA';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setShowPasswordDialog(false);
      setPendingToggle(null);
      setPasswordInput('');
      setSecurityLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="My Account"
        description="Manage your account settings, addresses, and preferences on Tobra"
        keywords="account settings, profile, addresses, preferences, Tobra"
      />
      
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-110px)]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-display text-gray-900 mb-8">My Account</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+233 20 123 4567"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>Delivery Addresses</span>
                    </CardTitle>
                    <Dialog open={isAddressDialogOpen} onOpenChange={(open) => {
                      setIsAddressDialogOpen(open);
                      if (!open) resetAddressForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="w-4 h-4" />
                          <span className="hidden md:inline-block ml-2">Add New Address</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingAddress ? 'Update your address information.' : 'Add a new delivery address to your account.'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="addressLabel">Address Label</Label>
                            <Input
                              id="addressLabel"
                              placeholder="e.g., Home, Office"
                              value={newAddress.label}
                              onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fullAddress">Full Address</Label>
                            <Input
                              id="fullAddress"
                              placeholder="Street, Area, City, Region"
                              value={newAddress.address}
                              onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              placeholder="+233 20 123 4567"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={editingAddress ? handleUpdateAddress : handleAddAddress} className='mb-1 md:mt-0'>
                            {editingAddress ? 'Update Address' : 'Add Address'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{address.label}</h3>
                              {address.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                              {address.address}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">{address.phone}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={address.isDefault}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications & Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePreferences} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-gray-600">Get notified about your order status</p>
                        </div>
                        <Switch 
                          checked={preferences.orderUpdates}
                          onCheckedChange={(checked) => setPreferences({...preferences, orderUpdates: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotional Offers</p>
                          <p className="text-sm text-gray-600">Receive deals and discounts</p>
                        </div>
                        <Switch 
                          checked={preferences.promotionalOffers}
                          onCheckedChange={(checked) => setPreferences({...preferences, promotionalOffers: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Product Alerts</p>
                          <p className="text-sm text-gray-600">Be the first to know about new products</p>
                        </div>
                        <Switch 
                          checked={preferences.newProductAlerts}
                          onCheckedChange={(checked) => setPreferences({...preferences, newProductAlerts: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Privacy</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Sharing</p>
                          <p className="text-sm text-gray-600">Allow sharing data for personalized experience</p>
                        </div>
                        <Switch 
                          checked={preferences.dataSharing}
                          onCheckedChange={(checked) => setPreferences({...preferences, dataSharing: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Communications</p>
                          <p className="text-sm text-gray-600">Receive marketing emails and SMS</p>
                        </div>
                        <Switch 
                          checked={preferences.marketingCommunications}
                          onCheckedChange={(checked) => setPreferences({...preferences, marketingCommunications: checked})}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit">Save Preferences</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account. By default, 2FA is off.
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      disabled={securityLoading}
                      onCheckedChange={(checked) => requestToggle2FA(checked ? 'enable' : 'disable')}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChangePassword />
                <DeviceManagement />
              </div>

              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{pendingToggle === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Please confirm your password to {pendingToggle === 'enable' ? 'enable' : 'disable'} 2FA on your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword">Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={confirmToggle2FA} disabled={securityLoading || !passwordInput}>
                      {pendingToggle === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Account;