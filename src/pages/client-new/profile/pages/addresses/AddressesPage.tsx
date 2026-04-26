import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { Skeleton } from "@/components/shared/Skeleton";
import { useAuthStore } from "@/stores";
import profileAddressesService, {
  type AddressType,
  type ProfileAddress,
} from "@/services/profileAddressesService";
import { useInstitutions, useHalls } from "@/hooks";
import { CustomSelectField } from "@/components/shared/text-field";
import api, { extractData } from "@/lib/api";
import { normalizeUser } from "@/lib/normalizeUser";

const GPS_LOCATION_REGEX = /^[A-Z]{2}-\d{3}-\d{4}$/;

const ADDRESS_TYPE_LABELS: Record<AddressType | "hall", string> = {
  home: "Home",
  off_campus_hostel: "Off-campus Hostel",
  hall: "Campus Hall",
};

export function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ProfileAddress | null>(
    null,
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unified Form State
  const [residenceFormType, setResidenceFormType] = useState<"hall" | AddressType>("home");
  const [hallID, setHallID] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    gpsLocation: "",
    isDefault: false,
  });

  const isResident = Boolean(user?.hallID);
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const { data: halls, isLoading: isLoadingHalls } = useHalls(user?.institutionID);

  const resetForm = () => {
    setResidenceFormType("home");
    setHallID("");
    setFormData({
      name: "",
      gpsLocation: "",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const loadAddresses = async () => {
    setError(null);
    setIsPageLoading(true);
    try {
      const items = await profileAddressesService.getAddresses();
      setAddresses(items);
    } catch (err: unknown) {
      if (isResident && err instanceof Error && err.message.includes("resident")) {
         // Backend explicitly blocks this route if resident, so just ignore it for residents
         setAddresses([]);
      } else {
         setError(err instanceof Error ? err.message : "Failed to load addresses");
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadAddresses();
  }, [isAuthenticated, isResident]);

  const handleEditPrimary = () => {
    if (isResident) {
      setResidenceFormType("hall");
      setHallID(user?.hallID || "");
    } else {
      if (defaultAddress) {
        setResidenceFormType(defaultAddress.type);
        setFormData({
          name: defaultAddress.name,
          gpsLocation: defaultAddress.gpsLocation,
          isDefault: true,
        });
        setEditingAddress(defaultAddress);
      } else {
        resetForm();
      }
    }
    setShowAddModal(true);
  };

  const handleEditOtherAddress = (address: ProfileAddress) => {
    setResidenceFormType(address.type);
    setFormData({
      name: address.name,
      gpsLocation: address.gpsLocation,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (residenceFormType === "hall") {
        if (!hallID) {
          setError("Please select a campus hall.");
          setIsLoading(false);
          return;
        }

        // Switch to resident or update hall
        const response = await api.patch('/user/me', { hallID });
        const data = extractData<{ user: any }>(response);
        setUser(normalizeUser(data.user));
        
        setShowAddModal(false);
        resetForm();
      } else {
        // Switching to off-campus or updating off-campus
        const nextName = formData.name.trim();
        const nextGpsLocation = formData.gpsLocation.trim().toUpperCase();

        if (!nextName || !nextGpsLocation) {
          setError("Address name and GPS location are required.");
          setIsLoading(false);
          return;
        }

        if (!GPS_LOCATION_REGEX.test(nextGpsLocation)) {
          setError("Use valid Ghana Post GPS format, for example EX-123-4567.");
          setIsLoading(false);
          return;
        }

        // If currently a resident, clear hallID first
        if (isResident && !editingAddress) {
          const response = await api.patch('/user/me', { hallID: "" });
          const data = extractData<{ user: any }>(response);
          setUser(normalizeUser(data.user));
        }

        const payload = {
          name: nextName,
          gpsLocation: nextGpsLocation,
          type: residenceFormType,
          isDefault: true, // When setting primary via unified UI, enforce default
        };

        const nextAddresses = editingAddress
          ? await profileAddressesService.updateAddress(editingAddress.id, { ...payload, isDefault: formData.isDefault })
          : await profileAddressesService.createAddress(payload);

        setAddresses(nextAddresses);
        setShowAddModal(false);
        resetForm();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const next = await profileAddressesService.deleteAddress(id);
      setAddresses(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      // If setting default, must ensure they are non-resident
      if (isResident) {
        const response = await api.patch('/user/me', { hallID: "" });
        const data = extractData<{ user: any }>(response);
        setUser(normalizeUser(data.user));
      }

      const next = await profileAddressesService.setDefaultAddress(id);
      setAddresses(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set default address");
    }
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/addresses");
    return null;
  }

  const secondaryAddresses = addresses.filter(a => a.id !== defaultAddress?.id);

  return (
    <div className="lg:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Saved Addresses
          </h1>
          <p className="text-sm text-gray-500">
            Manage your primary residence and delivery addresses
          </p>
        </div>
        {!isResident && addresses.length < 5 && (
          <Button
            onClick={handleOpenAddModal}
            className="rounded-full h-11 px-5 bg-[#1C1C1E] hover:bg-black text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Secondary Address
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Primary Residence Card */}
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Primary Residence</h2>
      {isPageLoading ? (
        <Skeleton className="h-32 w-full rounded-[24px] mb-8" />
      ) : (
        <div className={`mb-8 bg-white border rounded-[24px] overflow-hidden shadow-sm border-[#1C1C1E]/25 ring-1 ring-[#1C1C1E]/10`}>
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isResident ? "bg-purple-100 text-purple-600" :
                  defaultAddress?.type === "home" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                }`}>
                  {isResident ? <Building2 className="h-6 w-6" /> :
                   defaultAddress?.type === "home" ? <Home className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {isResident ? user?.residenceName || "Campus Hall" : defaultAddress?.name || "No Primary Address"}
                    </h3>
                    <Badge className="text-[11px] rounded-full bg-[#1C1C1E] text-white">
                      Primary
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {isResident ? "Campus Hall" : defaultAddress ? ADDRESS_TYPE_LABELS[defaultAddress.type] : "Please set a primary residence"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span>
                  {isResident 
                    ? `${user?.institutionName || "Institution"} Campus` 
                    : defaultAddress?.gpsLocation || "No GPS Location"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200"
              onClick={handleEditPrimary}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Change Primary Residence
            </Button>
          </div>
        </div>
      )}

      {/* Secondary Addresses */}
      {!isResident && secondaryAddresses.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Secondary Addresses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {secondaryAddresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white border rounded-[24px] overflow-hidden shadow-sm border-gray-100">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          address.type === "home" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {address.type === "home" ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {address.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {ADDRESS_TYPE_LABELS[address.type]}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-700 mb-4">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span>{address.gpsLocation}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-200 flex-1"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Set Primary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-200"
                        onClick={() => handleEditOtherAddress(address)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingAddress || isResident ? "Edit Primary Residence" : "Add Address"}
      >
        <div className="space-y-4">
          {/* Residence Type Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Residence Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(["hall", "home", "off_campus_hostel"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={residenceFormType === type ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full ${
                    residenceFormType === type
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E] hover:opacity-85"
                      : "border-gray-200"
                  }`}
                  onClick={() => setResidenceFormType(type)}
                >
                  {type === "home" && <Home className="h-4 w-4 mr-1" />}
                  {(type === "off_campus_hostel" || type === "hall") && (
                    <Building2 className="h-4 w-4 mr-1" />
                  )}
                  {ADDRESS_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>

          {residenceFormType === "hall" ? (
            <div className="pt-2">
              <CustomSelectField
                label="Select Campus Hall"
                placeholder="Choose your hall"
                labelPlacement="outside"
                value={hallID}
                inputProps={{
                  onChange: (e: any) => setHallID(e.target.value)
                }}
                isLoading={isLoadingHalls}
                selectProps={{
                  startContent: <Building2 className="h-4 w-4" />
                }}
                options={halls?.map((hall) => ({
                  value: hall.id,
                  label: hall.name,
                })) || []}
              />
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Address Name
                </label>
                <Input
                  placeholder="e.g., Home, Uncle Kojo Hostel"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 rounded-md"
                />
              </div>

              {/* GPS */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Ghana Post GPS Location
                </label>
                <Input
                  placeholder="EX-123-4567"
                  value={formData.gpsLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gpsLocation: e.target.value.toUpperCase(),
                    })
                  }
                  className="h-11 rounded-md"
                />
                <p className="mt-2 text-xs text-gray-500">Format: EX-123-4567</p>
              </div>

              {/* Default - Only show if editing a non-primary address */}
              {(!isResident && editingAddress && !editingAddress.isDefault) && (
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm text-gray-700">
                    Set as primary address
                  </span>
                </label>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="rounded-full bg-[#1C1C1E] hover:bg-black text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
