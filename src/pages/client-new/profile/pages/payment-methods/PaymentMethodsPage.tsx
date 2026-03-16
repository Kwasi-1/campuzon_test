import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  Check,
  Building2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/stores";

interface PaymentMethod {
  id: string;
  type: "mobile_money" | "card";
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
    id: "pm-1",
    type: "mobile_money",
    provider: "MTN Mobile Money",
    last4: "4567",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "mobile_money",
    provider: "Vodafone Cash",
    last4: "8901",
    isDefault: false,
  },
];

const MOBILE_MONEY_PROVIDERS = [
  { id: "mtn", name: "MTN Mobile Money", icon: "🟡" },
  { id: "vodafone", name: "Vodafone Cash", icon: "🔴" },
  { id: "airteltigo", name: "AirtelTigo Money", icon: "🔵" },
];

export function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"mobile_money" | "card">(
    "mobile_money",
  );
  const [filter, setFilter] = useState<"all" | "mobile_money" | "card">("all");

  // Form state
  const [formData, setFormData] = useState({
    provider: "mtn",
    phoneNumber: "",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      provider: "mtn",
      phoneNumber: "",
      isDefault: false,
    });
  };

  const handleAdd = () => {
    const provider = MOBILE_MONEY_PROVIDERS.find(
      (p) => p.id === formData.provider,
    );
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: "mobile_money",
      provider: provider?.name || "Mobile Money",
      last4: formData.phoneNumber.slice(-4),
      isDefault: formData.isDefault,
    };

    setPaymentMethods((prev) =>
      formData.isDefault
        ? [...prev.map((m) => ({ ...m, isDefault: false })), newMethod]
        : [...prev, newMethod],
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
      })),
    );
  };

  const getProviderIcon = (provider: string) => {
    if (provider.includes("MTN")) return "🟡";
    if (provider.includes("Vodafone")) return "🔴";
    if (provider.includes("AirtelTigo")) return "🔵";
    return "💳";
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/payments");
    return null;
  }

  const mobileMoneyCount = paymentMethods.filter(
    (m) => m.type === "mobile_money",
  ).length;
  const cardCount = paymentMethods.filter((m) => m.type === "card").length;

  const filteredMethods =
    filter === "all"
      ? paymentMethods
      : paymentMethods.filter((m) => m.type === filter);

  const sidebarCategories: {
    key: "all" | "mobile_money" | "card";
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All Methods", count: paymentMethods.length },
    { key: "mobile_money", label: "Mobile Money", count: mobileMoneyCount },
    { key: "card", label: "Cards", count: cardCount },
  ];

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Payment Methods
          </h1>
          <p className="text-sm text-gray-500">Manage your payment options</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="rounded-full h-11 px-5 bg-[#1C1C1E] hover:bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Security Notice */}
      <Alert className="border-emerald-100 bg-emerald-50/70 rounded-2xl px-4 py-3 mb-6">
        <Shield className="h-4 w-4 text-green-600" />
        <div>
          <p className="font-medium text-emerald-800">
            Your payment information is secure
          </p>
          <p className="text-sm text-emerald-700">
            We use industry-standard encryption and never store your full card
            details.
          </p>
        </div>
      </Alert>

      {/* Body: sidebar + content */}
      <div className="flex flex-col xl:flex-row gap-8 pb-12">
        {/* Sidebar Filters */}
        <div className="xl:w-64 shrink-0">
          <div className="flex xl:flex-col gap-3 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 scrollbar-hide xl:sticky xl:top-24">
            {sidebarCategories.map((cat) => {
              const isActive = filter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFilter(cat.key)}
                  className={`flex items-center justify-between pl-5 pr-[2px] py-[3px] xl:py-1 xl:pr-1 rounded-full transition-all shrink-0 xl:shrink-auto whitespace-nowrap xl:whitespace-normal border shadow-sm ${
                    isActive
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-[15px]">{cat.label}</span>
                  <span
                    className={`h-10 w-10 xl:w-12 xl:h-12 ml-3 flex items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="flex-1">
          {filteredMethods.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-16 w-16" />}
              title="No payment methods"
              description={
                filter !== "all"
                  ? `No ${filter === "mobile_money" ? "mobile money" : "card"} methods added`
                  : "Add a payment method to make checkout faster"
              }
              action={
                filter === "all" ? (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-full px-6 bg-[#1C1C1E] hover:bg-black text-white"
                  >
                    Add Payment Method
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setFilter("all")}
                    className="rounded-full"
                  >
                    View All
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-5">
              {filteredMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`bg-white border rounded-3xl overflow-hidden shadow-sm ${
                      method.isDefault
                        ? "border-[#1C1C1E]/30 ring-1 ring-[#1C1C1E]/10"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="p-5 md:p-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                            method.type === "mobile_money"
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {method.type === "mobile_money" ? (
                            getProviderIcon(method.provider)
                          ) : (
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {method.provider}
                            </h3>
                            {method.isDefault && (
                              <Badge className="text-[11px] rounded-full bg-[#1C1C1E] text-white hover:bg-black">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {method.type === "mobile_money" ? (
                              <>Ending in •••• {method.last4}</>
                            ) : (
                              <>
                                •••• {method.last4}
                                {method.expiryMonth && method.expiryYear && (
                                  <>
                                    {" "}
                                    · Expires {method.expiryMonth}/
                                    {method.expiryYear}
                                  </>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-gray-200"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(method.id)}
                          aria-label={`Delete ${method.provider}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="px-5 md:px-6 py-3 bg-[#F7F7F8] border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-500">
                        {method.type === "mobile_money"
                          ? "Mobile Money"
                          : "Card Payment"}
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        ID: {method.id}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAddType("mobile_money")}
              type="button"
              className={`p-4 rounded-2xl border text-center transition-all ${
                addType === "mobile_money"
                  ? "border-[#1C1C1E] bg-[#1C1C1E]/5"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Smartphone className="h-7 w-7 mx-auto mb-2 text-[#1C1C1E]" />
              <p className="font-medium text-gray-900">Mobile Money</p>
              <p className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</p>
            </button>
            <button
              onClick={() => setAddType("card")}
              type="button"
              className={`p-4 rounded-2xl border text-center transition-all ${
                addType === "card"
                  ? "border-[#1C1C1E] bg-[#1C1C1E]/5"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <CreditCard className="h-7 w-7 mx-auto mb-2 text-[#1C1C1E]" />
              <p className="font-medium text-gray-900">Debit/Credit Card</p>
              <p className="text-xs text-gray-500">Visa, Mastercard</p>
            </button>
          </div>

          {addType === "mobile_money" ? (
            <>
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {MOBILE_MONEY_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() =>
                        setFormData({ ...formData, provider: provider.id })
                      }
                      type="button"
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.provider === provider.id
                          ? "border-[#1C1C1E] bg-[#1C1C1E]/5"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <p className="text-xs font-medium mt-1 text-gray-700">
                        {provider.name.split(" ")[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="024 XXX XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Default */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="rounded border-input"
                />
                <span className="text-sm text-gray-700">
                  Set as default payment method
                </span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!formData.phoneNumber}
                  className="rounded-full bg-[#1C1C1E] hover:bg-black text-white"
                >
                  Add Payment Method
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-semibold mb-2 text-gray-900">
                Card Payments via Paystack
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Card details are securely handled by Paystack during checkout.
                You&apos;ll be redirected to enter your card information when
                making a payment.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="rounded-full"
              >
                Got it
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
