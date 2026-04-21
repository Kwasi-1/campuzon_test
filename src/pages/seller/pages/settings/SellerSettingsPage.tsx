import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Camera,
  Clock,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Store,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/shared/Modal";
import {
  CustomInputTextField,
  CustomSelectField,
  CustomTextareaField,
} from "@/components/shared/text-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import {
  useSellerAutoResponder,
  useSellerDeactivateStore,
  useSellerMyStore,
  useSellerUpdateAutoAccept,
  useSellerUpdateAutoResponder,
  useSellerUpdateStoreContact,
  useSellerUpdateStoreLocation,
  useSellerUpdateStorePreferences,
  useSellerUpdateStoreProfile,
} from "@/hooks/useSellerPortal";
import { useAuthStore } from "@/stores";
import { SellerPageTemplate } from "../../components/SellerPageTemplate";
import toast from "react-hot-toast";

const createEmptyStoreData = () => ({
  id: "",
  storeName: "",
  storeSlug: "",
  institution: "",
  description: "",
  logo: "",
  banner: "",
  email: "",
  phoneNumber: "",
  location: "",
  website: "",
  businessHours: "",
  autoResponderEnabled: false,
  autoResponderName: "",
  autoResponderMessage: "",
});

const INSTITUTION_OPTIONS = [
  { value: "ug", label: "University of Ghana" },
  { value: "knust", label: "KNUST" },
  { value: "ucc", label: "University of Cape Coast" },
  { value: "uew", label: "University of Education, Winneba" },
  { value: "ashesi", label: "Ashesi University" },
];

type SettingsSection =
  | "all"
  | "branding"
  | "contact"
  | "automation"
  | "notifications"
  | "danger";

const SECTION_OPTIONS = [
  { key: "all", label: "All Settings" },
  { key: "branding", label: "Store Branding" },
  { key: "contact", label: "Contact Info" },
  { key: "automation", label: "Auto-Responder" },
  { key: "notifications", label: "Notifications" },
  { key: "danger", label: "Danger Zone" },
];

export function SellerSettingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { data: store } = useSellerMyStore();
  const { data: autoResponder } = useSellerAutoResponder();
  const updateAutoResponder = useSellerUpdateAutoResponder();
  const updateStoreProfile = useSellerUpdateStoreProfile();
  const updateStoreContact = useSellerUpdateStoreContact();
  const updateStoreLocation = useSellerUpdateStoreLocation();
  const updateStorePreferences = useSellerUpdateStorePreferences();
  const updateAutoAccept = useSellerUpdateAutoAccept();
  const deactivateStore = useSellerDeactivateStore();

  const [formData, setFormData] = useState(createEmptyStoreData);
  const [activeSection, setActiveSection] = useState<SettingsSection>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState<boolean>(true);
  const [notificationPrefs, setNotificationPrefs] = useState({
    newOrder: true,
    newMessage: true,
    lowStock: true,
    reviews: true,
  });

  const storeActionBlockReason =
    store?.status === "pending"
      ? "Your store is not active. Please wait for approval."
      : store?.status === "suspended"
        ? "Your store is suspended. Only admin can reactivate this store."
        : store?.status === "closed"
          ? "Your store is closed. Contact support for next steps."
          : null;

  // Synchronize auto-responder data from backend
  useEffect(() => {
    if (autoResponder) {
      setFormData((prev) => ({
        ...prev,
        autoResponderEnabled: autoResponder.enabled,
        autoResponderName: autoResponder.botName,
        autoResponderMessage: autoResponder.message,
      }));
    }
  }, [autoResponder]);

  useEffect(() => {
    if (!store) return;

    setFormData((prev) => ({
      ...prev,
      id: store.id,
      storeName: store.storeName ?? "",
      storeSlug: store.storeSlug ?? "",
      description: store.description ?? "",
      logo: store.logo ?? "",
      banner: store.banner ?? "",
      email: store.email ?? "",
      phoneNumber: store.phoneNumber ?? "",
    }));
    // Sync auto-accept from store
    setAutoAcceptOrders(store.autoAcceptOrders ?? true);
  }, [store]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setSaveInfo(null);
  };

  const handleNotificationToggle = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
    setSaveInfo(null);
  };

  const handleImageUpload = (
    type: "logo" | "banner",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
    if (storeActionBlockReason) {
      toast.error(storeActionBlockReason);
      return;
    }

    setIsSaving(true);
    setSaveInfo(null);

    try {
      const looksLikeUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const canPatchLocation = looksLikeUuid.test(formData.institution);

      await Promise.all([
        updateStoreProfile.mutateAsync({
          storeName: formData.storeName,
          description: formData.description,
        }),
        updateStoreContact.mutateAsync({
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        }),
        updateStorePreferences.mutateAsync({
          notifyOnOrder: notificationPrefs.newOrder,
        }),
        updateAutoResponder.mutateAsync({
          enabled: formData.autoResponderEnabled,
          botName: formData.autoResponderName,
          message: formData.autoResponderMessage,
        }),
        ...(canPatchLocation
          ? [updateStoreLocation.mutateAsync({ hallId: formData.institution })]
          : []),
      ]);

      if (!canPatchLocation) {
        setSaveInfo(
          "Location mapping is not connected yet. Contact/location hall mapping requires backend hall IDs.",
        );
      }

      setSaveSuccess(true);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!store) return;

    try {
      await deactivateStore.mutateAsync(
        "Seller requested deactivation from settings",
      );
      setDeactivateModalOpen(false);
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Deactivate store failed:", error);
    }
  };

  const handleDelete = () => {
    // In a real app, this would call an API
    console.log("Deleting store");
    setDeleteModalOpen(false);
    navigate("/");
  };

  const showSection = (section: Exclude<SettingsSection, "all">) =>
    activeSection === "all" || activeSection === section;

  const sidebar = (
    <div className="hidden md:block space-y-4 md:space-y-6 lg:sticky lg:top-48">
      <PillSidebar
        options={SECTION_OPTIONS.map((option) => ({
          key: option.key,
          label: option.label,
        }))}
        activeKey={activeSection}
        onChange={(key) => setActiveSection(key as SettingsSection)}
      />
      <div className="grid grid-cols-1 gap-2">
        {/* <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Sections</p>
          <p className="text-lg font-semibold text-gray-900">5</p>
        </div> */}
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Alerts On</p>
          <p className="text-lg font-semibold text-gray-900">
            {Object.values(notificationPrefs).filter(Boolean).length}
          </p>
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <Button
      onClick={handleSave}
      disabled={isSaving || Boolean(storeActionBlockReason)}
      title={storeActionBlockReason || "Save Changes"}
      className="rounded-full bg-[#1C1C1E] text-white hover:bg-black"
    >
      <Save className="mr-2 h-4 w-4" />
      {isSaving ? "Saving..." : "Save Changes"}
    </Button>
  );

  return (
    <>
      <SellerPageTemplate
        title="Store Settings"
        description="Manage your store profile, customer communication, and account preferences"
        headerActions={headerActions}
        sidebar={sidebar}
      >
        {saveSuccess ? (
          <Alert variant="success" className="mb-6">
            Settings saved successfully!
          </Alert>
        ) : null}

        {saveInfo ? (
          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900">
            {saveInfo}
          </Alert>
        ) : null}

        <div className="space-y-6">
          {showSection("branding") ? (
            <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  {/* <Store className="h-5 w-5" /> */}
                  Store Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Store Banner
                  </label>
                  <div
                    className="group relative h-40 cursor-pointer overflow-hidden rounded-2xl bg-gray-100"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {formData.banner ? (
                      <img
                        src={formData.banner}
                        alt="Store banner"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    title="Upload Store Banner"
                    onChange={(e) => handleImageUpload("banner", e)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 1200x300 pixels
                  </p>
                </div>

                <div className="mb-6 flex items-start gap-4">
                  <div
                    className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-gray-100"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Store logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    title="Upload Store Logo"
                    onChange={(e) => handleImageUpload("logo", e)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Store Logo
                    </label>
                    <p className="text-sm text-gray-500">
                      Square image, at least 200x200 pixels
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <CustomInputTextField
                      label="Store Name"
                      value={formData.storeName}
                      onChange={(e) =>
                        handleChange("storeName", e.target.value)
                      }
                      placeholder="Your store name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Store URL
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 bg-gray-50 px-3 text-sm text-gray-500">
                        campuzon.com/store/
                      </span>
                      <CustomInputTextField
                        value={formData.storeSlug}
                        onChange={(e) =>
                          handleChange(
                            "storeSlug",
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <CustomTextareaField
                    label="Store Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Tell customers about your store..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSection("contact") ? (
            <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <CustomInputTextField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="store@example.com"
                    />
                  </div>
                  <div>
                    <CustomInputTextField
                      label="Phone Number"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <CustomSelectField
                      label="Location / Institution"
                      labelPlacement="outside"
                      value={formData.institution}
                      inputProps={{
                        onChange: (e) =>
                          handleChange("institution", e.target.value),
                      }}
                      options={INSTITUTION_OPTIONS}
                    />
                  </div>
                  <div>
                    <CustomInputTextField
                      label="Website (Optional)"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <CustomInputTextField
                      label="Business Hours"
                      value={formData.businessHours}
                      onChange={(e) =>
                        handleChange("businessHours", e.target.value)
                      }
                      placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSection("automation") ? (
            <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  Auto-Responder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Enable Auto-Responder
                      </p>
                      <p className="text-sm text-gray-500">
                        Automatically reply to customer messages when you're
                        away
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={formData.autoResponderEnabled}
                        onChange={(e) =>
                          handleChange("autoResponderEnabled", e.target.checked)
                        }
                        className="peer sr-only"
                        title="Enable Auto-Responder"
                      />
                      <div className="h-6 w-11 rounded-full bg-muted transition peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                    </label>
                  </div>

                  {formData.autoResponderEnabled ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <CustomInputTextField
                          label="Bot Name"
                          value={formData.autoResponderName}
                          onChange={(e) =>
                            handleChange("autoResponderName", e.target.value)
                          }
                          placeholder="e.g., StoreBot"
                        />
                      </div>
                      <div>
                        <CustomTextareaField
                          label="Auto-Reply Message"
                          value={formData.autoResponderMessage}
                          onChange={(e) =>
                            handleChange("autoResponderMessage", e.target.value)
                          }
                          placeholder="Thanks for your message..."
                          rows={3}
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSection("notifications") ? (
            <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {/* Auto-Accept Orders Toggle */}
                <div className="mb-5 space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Order Preferences
                  </p>
                  <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <div className="pr-4">
                      <p className="font-medium text-gray-900">
                        Auto-accept orders
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {autoAcceptOrders
                          ? "All incoming orders are auto-accepted. Buyers go straight to payment."
                          : "You must manually accept each offer before the buyer can pay."}
                      </p>
                    </div>
                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={autoAcceptOrders}
                        onChange={() => {
                          const next = !autoAcceptOrders;
                          setAutoAcceptOrders(next);
                          updateAutoAccept.mutate(next);
                        }}
                        className="peer sr-only"
                        title="Toggle auto-accept orders"
                      />
                      <div className="h-6 w-11 rounded-full bg-muted transition peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300/40 peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                    </label>
                  </div>
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Notification Alerts
                </p>
                <div className="space-y-3">
                  {[
                    {
                      id: "newOrder",
                      label: "New Order",
                      description: "Get notified when you receive a new order",
                    },
                    {
                      id: "newMessage",
                      label: "New Message",
                      description:
                        "Get notified when a customer sends a message",
                    },
                    {
                      id: "lowStock",
                      label: "Low Stock Alert",
                      description: "Get notified when product stock is low",
                    },
                    {
                      id: "reviews",
                      label: "New Reviews",
                      description: "Get notified when customers leave reviews",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={
                            notificationPrefs[
                              item.id as keyof typeof notificationPrefs
                            ]
                          }
                          onChange={() =>
                            handleNotificationToggle(
                              item.id as keyof typeof notificationPrefs,
                            )
                          }
                          className="peer sr-only"
                          title={item.label}
                        />
                        <div className="h-6 w-11 rounded-full bg-muted transition peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSection("danger") ? (
            <Card className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-600">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
                  Only admin can reactivate this store after deactivation.
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-red-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Deactivate Store
                      </p>
                      <p className="text-sm text-gray-500">
                        Temporarily hide your store from customers
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setDeactivateModalOpen(true)}
                      disabled={store?.status === "suspended"}
                      title={
                        store?.status === "suspended"
                          ? "Store already deactivated"
                          : "Deactivate Store"
                      }
                    >
                      <Lock className="mr-1 h-4 w-4" />
                      Deactivate
                    </Button>
                  </div>

                  {(store?.status === "suspended" ||
                    store?.status === "pending") && (
                    <div className="flex items-center justify-between rounded-xl border border-blue-200 p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          Request Reactivation
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact support and include your store name for faster
                          review.
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <a
                          href={`mailto:support@campuzon.me?subject=Store Reactivation Request - ${encodeURIComponent(formData.storeName)}`}
                        >
                          Contact Support
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-red-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Delete Store</p>
                      <p className="text-sm text-gray-500">
                        Permanently delete your store and all data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </SellerPageTemplate>

      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title="Deactivate Store"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to deactivate your store? Your products will
            be hidden from customers.
          </p>
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            Only admin can reactivate this store.
          </Alert>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeactivate()}
              disabled={deactivateStore.isPending}
            >
              {deactivateStore.isPending
                ? "Deactivating..."
                : "Deactivate Store"}
            </Button>
          </div>
        </div>
      </Modal>

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
          <p>Deleting your store will permanently remove:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>All your products</li>
            <li>Order history</li>
            <li>Customer messages</li>
            <li>Store reviews and ratings</li>
          </ul>
          <p>
            Type <strong>DELETE</strong> to confirm:
          </p>
          <CustomInputTextField placeholder="Type DELETE" />
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
    </>
  );
}
