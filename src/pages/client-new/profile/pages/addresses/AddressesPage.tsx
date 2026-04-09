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

const GPS_LOCATION_REGEX = /^[A-Z]{2}-\d{3}-\d{4}$/;

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  home: "Home",
  off_campus_hostel: "Off-campus Hostel",
};

export function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ProfileAddress | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AddressType>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    gpsLocation: "",
    type: "home" as AddressType,
    isDefault: false,
  });

  const isResident = Boolean(user?.hallID);

  const resetForm = () => {
    setFormData({
      name: "",
      gpsLocation: "",
      type: "home",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenAddModal = () => {
    if (isResident) {
      setError(
        "Residents use their assigned hall for deliveries and cannot add saved addresses.",
      );
      return;
    }
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
      setError(err instanceof Error ? err.message : "Failed to load addresses");
      setAddresses([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadAddresses();
  }, [isAuthenticated]);

  const handleEdit = (address: ProfileAddress) => {
    if (isResident) {
      setError(
        "Residents use their assigned hall for deliveries and cannot edit saved addresses.",
      );
      return;
    }

    setFormData({
      name: address.name,
      gpsLocation: address.gpsLocation,
      type: address.type,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (isResident) {
      setError(
        "Residents use their assigned hall for deliveries and cannot save addresses.",
      );
      return;
    }

    const nextName = formData.name.trim();
    const nextGpsLocation = formData.gpsLocation.trim().toUpperCase();

    if (!nextName || !nextGpsLocation) {
      setError("Address name and GPS location are required.");
      return;
    }

    if (!GPS_LOCATION_REGEX.test(nextGpsLocation)) {
      setError("Use valid Ghana Post GPS format, for example EX-123-4567.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: nextName,
        gpsLocation: nextGpsLocation,
        type: formData.type,
        isDefault: formData.isDefault,
      };

      const next = editingAddress
        ? await profileAddressesService.updateAddress(
            editingAddress.id,
            payload,
          )
        : await profileAddressesService.createAddress(payload);

      setAddresses(next);
      setShowAddModal(false);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isResident) {
      setError(
        "Residents use their assigned hall for deliveries and cannot delete saved addresses.",
      );
      return;
    }

    setError(null);
    try {
      const next = await profileAddressesService.deleteAddress(id);
      setAddresses(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    if (isResident) {
      setError(
        "Residents use their assigned hall for deliveries and cannot update saved addresses.",
      );
      return;
    }

    setError(null);
    try {
      const next = await profileAddressesService.setDefaultAddress(id);
      setAddresses(next);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to set default address",
      );
    }
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/addresses");
    return null;
  }

  const homeCount = addresses.filter((a) => a.type === "home").length;
  const offCampusHostelCount = addresses.filter(
    (a) => a.type === "off_campus_hostel",
  ).length;

  const filteredAddresses =
    filter === "all" ? addresses : addresses.filter((a) => a.type === filter);

  const sidebarCategories: {
    key: "all" | AddressType;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All Addresses", count: addresses.length },
    { key: "home", label: "Home", count: homeCount },
    {
      key: "off_campus_hostel",
      label: "Off-campus Hostel",
      count: offCampusHostelCount,
    },
  ];

  return (
    <div className="lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Saved Addresses
          </h1>
          <p className="text-sm text-gray-500">
            Manage your delivery addresses
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          disabled={isResident}
          title={
            isResident
              ? "Residents use their assigned hall for delivery"
              : "Add Address"
          }
          className="rounded-full h-11 px-5 bg-[#1C1C1E] hover:bg-black text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {isResident && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900">
          You are assigned to a hall. Saved custom addresses are available only
          for non-resident users.
        </Alert>
      )}

      {/* Body: sidebar + content */}
      <div className="flex flex-col xl:flex-row gap-8 pb-12">
        {/* Sidebar Filters */}
        <div className="xl:w-64 shrink-0">
          <div className="flex xl:flex-col lg:sticky lg:top-36 gap-3 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 scrollbar-hide xl:sticky xl:top-24">
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

        {/* Addresses List */}
        <div className="flex-1">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          {isPageLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-gray-100 bg-white p-5 md:p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-11 w-11 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : filteredAddresses.length === 0 ? (
            <div className="border border-gray-100 bg-white rounded-[28px] overflow-hidden shadow-sm">
              <div className="text-center py-16 flex flex-col justify-center h-full items-center">
                <EmptyState
                  icon={<MapPin className="h-16 w-16" />}
                  title="No addresses saved"
                  description={
                    filter !== "all"
                      ? `No ${
                          filter === "off_campus_hostel"
                            ? "off-campus hostel"
                            : filter
                        } addresses saved`
                      : "Add a delivery address to make checkout faster"
                  }
                  action={
                    filter === "all" && !isResident ? (
                      <Button
                        onClick={handleOpenAddModal}
                        className="rounded-full px-6 bg-[#1C1C1E] hover:bg-black text-white"
                      >
                        Add Address
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
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAddresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`bg-white border rounded-[24px] overflow-hidden shadow-sm ${
                      address.isDefault
                        ? "border-[#1C1C1E]/25 ring-1 ring-[#1C1C1E]/10"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                              address.type === "home"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {address.type === "home" ? (
                              <Home className="h-5 w-5" />
                            ) : (
                              <Building2 className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {address.name}
                              </h3>
                              {address.isDefault && (
                                <Badge className="text-[11px] rounded-full bg-[#1C1C1E] text-white hover:bg-black">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {ADDRESS_TYPE_LABELS[address.type]}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                          <span>{address.gpsLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-5 md:px-6 py-3 border-t border-gray-100 bg-[#F7F7F8]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-200"
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
                            className="rounded-full border-gray-200"
                            onClick={() => handleSetDefault(address.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Set Default
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(address.id)}
                            aria-label={`Delete ${address.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      >
        <div className="space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Address Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(["home", "off_campus_hostel"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`rounded-full ${
                    formData.type === type
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E] hover:bg-black"
                      : "border-gray-200"
                  }`}
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type === "home" && <Home className="h-4 w-4 mr-1" />}
                  {type === "off_campus_hostel" && (
                    <Building2 className="h-4 w-4 mr-1" />
                  )}
                  {ADDRESS_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>

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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
            />
            <p className="mt-2 text-xs text-gray-500">Format: EX-123-4567</p>
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
              Set as default address
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              disabled={
                !formData.name ||
                !formData.gpsLocation ||
                !GPS_LOCATION_REGEX.test(formData.gpsLocation.trim()) ||
                isResident ||
                isLoading
              }
              className="rounded-full bg-[#1C1C1E] hover:bg-black text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingAddress ? (
                "Save Changes"
              ) : (
                "Add Address"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
