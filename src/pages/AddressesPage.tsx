import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  EmptyState,
  Breadcrumb,
  Modal,
} from '@/components/ui';
import { useAuthStore } from '@/stores';

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  hall?: string;
  room?: string;
  phone?: string;
  isDefault: boolean;
  type: 'hall' | 'home' | 'other';
}

// Mock addresses
const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    label: 'My Hall',
    fullAddress: 'Legon Hall, Room A101',
    hall: 'Legon Hall',
    room: 'A101',
    phone: '+233 24 123 4567',
    isDefault: true,
    type: 'hall',
  },
  {
    id: 'addr-2',
    label: 'Home',
    fullAddress: '15 Independence Avenue, Accra',
    phone: '+233 20 987 6543',
    isDefault: false,
    type: 'home',
  },
];

export function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    label: '',
    fullAddress: '',
    hall: '',
    room: '',
    phone: '',
    type: 'hall' as 'hall' | 'home' | 'other',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      label: '',
      fullAddress: '',
      hall: '',
      room: '',
      phone: '',
      type: 'hall',
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      fullAddress: address.fullAddress,
      hall: address.hall || '',
      room: address.room || '',
      phone: address.phone || '',
      type: address.type,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingAddress) {
      // Update existing
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                ...formData,
                fullAddress: formData.type === 'hall'
                  ? `${formData.hall}, Room ${formData.room}`
                  : formData.fullAddress,
              }
            : formData.isDefault
            ? { ...addr, isDefault: false }
            : addr
        )
      );
    } else {
      // Add new
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label: formData.label,
        fullAddress:
          formData.type === 'hall'
            ? `${formData.hall}, Room ${formData.room}`
            : formData.fullAddress,
        hall: formData.hall || undefined,
        room: formData.room || undefined,
        phone: formData.phone || undefined,
        type: formData.type,
        isDefault: formData.isDefault,
      };
      setAddresses((prev) =>
        formData.isDefault
          ? [...prev.map((a) => ({ ...a, isDefault: false })), newAddress]
          : [...prev, newAddress]
      );
    }

    setIsLoading(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/addresses');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Addresses' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-16 w-16" />}
          title="No addresses saved"
          description="Add a delivery address to make checkout faster"
          action={<Button onClick={handleOpenAddModal}>Add Address</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={address.isDefault ? 'border-primary' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          address.type === 'hall'
                            ? 'bg-blue-100 text-blue-600'
                            : address.type === 'home'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {address.type === 'hall' ? (
                          <Building2 className="h-5 w-5" />
                        ) : (
                          <Home className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{address.label}</h3>
                          {address.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.type === 'hall' ? 'Campus Hall' : 'Home Address'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{address.fullAddress}</span>
                    </div>
                    {address.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span className="text-sm">{address.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <div className="space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Address Type</label>
            <div className="flex gap-2">
              {(['hall', 'home', 'other'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type === 'hall' && <Building2 className="h-4 w-4 mr-1" />}
                  {type === 'home' && <Home className="h-4 w-4 mr-1" />}
                  {type === 'other' && <MapPin className="h-4 w-4 mr-1" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-2">Label</label>
            <Input
              placeholder="e.g., My Hall, Office"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>

          {/* Hall-specific fields */}
          {formData.type === 'hall' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Hall Name</label>
                <Input
                  placeholder="e.g., Legon Hall"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Room Number</label>
                <Input
                  placeholder="e.g., A101"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Full Address</label>
              <Input
                placeholder="Enter your full address"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input
              placeholder="+233 XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-input"
            />
            <span className="text-sm">Set as default address</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.label ||
                (formData.type === 'hall' ? !formData.hall || !formData.room : !formData.fullAddress) ||
                isLoading
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingAddress ? (
                'Save Changes'
              ) : (
                'Add Address'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
