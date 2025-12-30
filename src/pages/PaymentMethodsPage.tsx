import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  Check,
  Building2,
  Shield,
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
  Alert,
} from '@/components/ui';
import { useAuthStore } from '@/stores';

interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'card';
  provider: string;
  last4: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'mobile_money',
    provider: 'MTN Mobile Money',
    last4: '4567',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'mobile_money',
    provider: 'Vodafone Cash',
    last4: '8901',
    isDefault: false,
  },
];

const MOBILE_MONEY_PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', icon: '🟡' },
  { id: 'vodafone', name: 'Vodafone Cash', icon: '🔴' },
  { id: 'airteltigo', name: 'AirtelTigo Money', icon: '🔵' },
];

export function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'mobile_money' | 'card'>('mobile_money');

  // Form state
  const [formData, setFormData] = useState({
    provider: 'mtn',
    phoneNumber: '',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      provider: 'mtn',
      phoneNumber: '',
      isDefault: false,
    });
  };

  const handleAdd = () => {
    const provider = MOBILE_MONEY_PROVIDERS.find((p) => p.id === formData.provider);
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'mobile_money',
      provider: provider?.name || 'Mobile Money',
      last4: formData.phoneNumber.slice(-4),
      isDefault: formData.isDefault,
    };

    setPaymentMethods((prev) =>
      formData.isDefault
        ? [...prev.map((m) => ({ ...m, isDefault: false })), newMethod]
        : [...prev, newMethod]
    );

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const getProviderIcon = (provider: string) => {
    if (provider.includes('MTN')) return '🟡';
    if (provider.includes('Vodafone')) return '🔴';
    if (provider.includes('AirtelTigo')) return '🔵';
    return '💳';
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/payments');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Payment Methods' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment options</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Security Notice */}
      <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <Shield className="h-4 w-4 text-green-600" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-200">
            Your payment information is secure
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            We use industry-standard encryption and never store your full card details.
          </p>
        </div>
      </Alert>

      {paymentMethods.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-16 w-16" />}
          title="No payment methods"
          description="Add a payment method to make checkout faster"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              Add Payment Method
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={method.isDefault ? 'border-primary' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          method.type === 'mobile_money'
                            ? 'bg-yellow-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {method.type === 'mobile_money' ? (
                          getProviderIcon(method.provider)
                        ) : (
                          <CreditCard className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{method.provider}</h3>
                          {method.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'mobile_money' ? (
                            <>Ending in •••• {method.last4}</>
                          ) : (
                            <>
                              •••• {method.last4}
                              {method.expiryMonth && method.expiryYear && (
                                <> · Expires {method.expiryMonth}/{method.expiryYear}</>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Payment Method"
      >
        <div className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAddType('mobile_money')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                addType === 'mobile_money'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Mobile Money</p>
              <p className="text-xs text-muted-foreground">MTN, Vodafone, AirtelTigo</p>
            </button>
            <button
              onClick={() => setAddType('card')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                addType === 'card'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Debit/Credit Card</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
            </button>
          </div>

          {addType === 'mobile_money' ? (
            <>
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {MOBILE_MONEY_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setFormData({ ...formData, provider: provider.id })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.provider === provider.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <p className="text-xs font-medium mt-1">
                        {provider.name.split(' ')[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="024 XXX XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                <span className="text-sm">Set as default payment method</span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!formData.phoneNumber}>
                  Add Payment Method
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Card Payments via Paystack</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Card details are securely handled by Paystack during checkout.
                You'll be redirected to enter your card information when making a payment.
              </p>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Got it
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
