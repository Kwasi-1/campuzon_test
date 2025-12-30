import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Camera,
  Save,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  MessageSquare,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Select,
  Breadcrumb,
  Modal,
  Alert,
} from '@/components/ui';
import { useAuthStore } from '@/stores';

// Mock store data
const mockStoreData = {
  id: 'store-1',
  storeName: 'TechHub GH',
  storeSlug: 'techhub-gh',
  description: 'Your trusted source for premium electronics and gadgets. We offer authentic products with warranty and excellent customer service.',
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
  banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  email: 'contact@techhub.gh',
  phoneNumber: '+233 24 123 4567',
  location: 'University of Ghana, Legon',
  website: 'https://techhub.gh',
  businessHours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
  autoResponderEnabled: true,
  autoResponderName: 'TechBot',
  autoResponderMessage: 'Thanks for reaching out! We\'ll get back to you within 30 minutes during business hours.',
};

const INSTITUTION_OPTIONS = [
  { value: 'ug', label: 'University of Ghana' },
  { value: 'knust', label: 'KNUST' },
  { value: 'ucc', label: 'University of Cape Coast' },
  { value: 'uew', label: 'University of Education, Winneba' },
  { value: 'ashesi', label: 'Ashesi University' },
];

export function SellerSettingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState(mockStoreData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate('/login');
    return null;
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleImageUpload = (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(type, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
  };

  const handleDeactivate = () => {
    // In a real app, this would call an API
    console.log('Deactivating store');
    setDeactivateModalOpen(false);
    navigate('/seller/dashboard');
  };

  const handleDelete = () => {
    // In a real app, this would call an API
    console.log('Deleting store');
    setDeleteModalOpen(false);
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Seller Dashboard', href: '/seller/dashboard' },
          { label: 'Store Settings' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">
            Manage your store profile and preferences
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveSuccess && (
        <Alert variant="success" className="mb-6">
          Settings saved successfully!
        </Alert>
      )}

      <div className="space-y-6">
        {/* Store Branding */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Branding
            </h2>

            {/* Banner */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Store Banner</label>
              <div
                className="relative h-40 rounded-lg bg-muted overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
              >
                {formData.banner ? (
                  <img
                    src={formData.banner}
                    alt="Store banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload('banner', e)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 1200x300 pixels
              </p>
            </div>

            {/* Logo */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="relative w-24 h-24 rounded-lg bg-muted overflow-hidden cursor-pointer group flex-shrink-0"
                onClick={() => logoInputRef.current?.click()}
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Store logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload('logo', e)}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Store Logo</label>
                <p className="text-sm text-muted-foreground">
                  Square image, at least 200x200 pixels
                </p>
              </div>
            </div>

            {/* Store Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="Your store name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store URL</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-sm text-muted-foreground">
                    campuzon.com/store/
                  </span>
                  <Input
                    value={formData.storeSlug}
                    onChange={(e) => handleChange('storeSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Store Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell customers about your store..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="store@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location / Institution
                </label>
                <Select
                  value="ug"
                  onChange={(e) => handleChange('institution', e.target.value)}
                  options={INSTITUTION_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Business Hours
                </label>
                <Input
                  value={formData.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Responder */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Auto-Responder
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Auto-Responder</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically reply to customer messages when you're away
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoResponderEnabled}
                    onChange={(e) => handleChange('autoResponderEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.autoResponderEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Bot Name</label>
                    <Input
                      value={formData.autoResponderName}
                      onChange={(e) => handleChange('autoResponderName', e.target.value)}
                      placeholder="e.g., StoreBot"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Auto-Reply Message</label>
                    <Textarea
                      value={formData.autoResponderMessage}
                      onChange={(e) => handleChange('autoResponderMessage', e.target.value)}
                      placeholder="Thanks for your message..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>

            <div className="space-y-4">
              {[
                { id: 'newOrder', label: 'New Order', description: 'Get notified when you receive a new order' },
                { id: 'newMessage', label: 'New Message', description: 'Get notified when a customer sends a message' },
                { id: 'lowStock', label: 'Low Stock Alert', description: 'Get notified when product stock is low' },
                { id: 'reviews', label: 'New Reviews', description: 'Get notified when customers leave reviews' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                <div>
                  <p className="font-medium">Deactivate Store</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily hide your store from customers
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeactivateModalOpen(true)}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                <div>
                  <p className="font-medium">Delete Store</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your store and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deactivate Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title="Deactivate Store"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to deactivate your store? Your products will be hidden from customers until you reactivate.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Deactivate Store
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Store"
      >
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            This action cannot be undone!
          </Alert>
          <p>
            Deleting your store will permanently remove:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>All your products</li>
            <li>Order history</li>
            <li>Customer messages</li>
            <li>Store reviews and ratings</li>
          </ul>
          <p>Type <strong>DELETE</strong> to confirm:</p>
          <Input placeholder="Type DELETE" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
