import api, { extractData } from "@/lib/api";

export type AddressType = "home" | "off_campus_hostel";

export interface ProfileAddress {
  id: string;
  name: string;
  gpsLocation: string;
  isDefault: boolean;
  type: AddressType;
}

interface AddressPayload {
  name: string;
  gpsLocation: string;
  isDefault: boolean;
  type: AddressType;
}

const STORAGE_KEY = "campuzon_profile_addresses";
const ENABLE_REMOTE_ADDRESSES =
  import.meta.env.VITE_ENABLE_PROFILE_ADDRESSES_API === "true";

const defaultAddresses: ProfileAddress[] = [
  {
    id: "addr-1",
    name: "Home",
    gpsLocation: "GA-123-4567",
    isDefault: true,
    type: "home",
  },
  {
    id: "addr-2",
    name: "Off-campus Hostel",
    gpsLocation: "GA-456-1234",
    isDefault: false,
    type: "off_campus_hostel",
  },
];

const normalizeAddressType = (value: unknown): AddressType => {
  const raw = String(value ?? "").trim().toLowerCase();

  if (
    raw === "off_campus_hostel" ||
    raw === "off-campus-hostel" ||
    raw === "off campus hostel"
  ) {
    return "off_campus_hostel";
  }

  return "home";
};

const normalizeAddress = (item: unknown): ProfileAddress => {
  const value = (item ?? {}) as Record<string, unknown>;
  const fallbackName = String(value.label ?? "Address").trim();

  return {
    id: String(value.id ?? `addr-${Date.now()}`),
    name: String(value.name ?? value.hostelName ?? fallbackName).trim(),
    gpsLocation: String(
      value.gpsLocation ?? value.fullAddress ?? "",
    ).trim(),
    isDefault: Boolean(value.isDefault),
    type: normalizeAddressType(value.type ?? value.hostel),
  };
};

const toAddressList = (data: unknown): ProfileAddress[] => {
  if (Array.isArray(data)) {
    return ensureSingleDefault(data.map(normalizeAddress));
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.addresses)) {
      return ensureSingleDefault(record.addresses.map(normalizeAddress));
    }

    if (record.address && typeof record.address === "object") {
      return ensureSingleDefault([normalizeAddress(record.address)]);
    }
  }

  return [];
};

const toRequestPayload = (payload: AddressPayload): AddressPayload => ({
  ...payload,
  name: payload.name.trim(),
  gpsLocation: payload.gpsLocation.trim().toUpperCase(),
  type: normalizeAddressType(payload.type),
});

const ensureSingleDefault = (items: ProfileAddress[]) => {
  const defaultCount = items.filter((a) => a.isDefault).length;
  if (defaultCount <= 1) return items;

  let seenDefault = false;
  return items.map((a) => {
    if (!a.isDefault) return a;
    if (!seenDefault) {
      seenDefault = true;
      return a;
    }
    return { ...a, isDefault: false };
  });
};

const readLocal = (): ProfileAddress[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAddresses;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return toAddressList(parsed);
  } catch {
    return defaultAddresses;
  }
};

const writeLocal = (items: ProfileAddress[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ensureSingleDefault(items)));
};

class ProfileAddressesService {
  async getAddresses(): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      const response = await api.get("/user/me/addresses");
      const data = extractData<unknown>(response);
      return toAddressList(data);
    }

    const items = readLocal();
    writeLocal(items);
    return items;
  }

  async createAddress(payload: AddressPayload): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      await api.post("/user/me/addresses", toRequestPayload(payload));
      return this.getAddresses();
    }

    const nextAddress: ProfileAddress = {
      id: `addr-${Date.now()}`,
      ...toRequestPayload(payload),
    };

    const current = readLocal();
    const updated = payload.isDefault
      ? [...current.map((a) => ({ ...a, isDefault: false })), nextAddress]
      : [...current, nextAddress];

    writeLocal(updated);
    return updated;
  }

  async updateAddress(
    id: string,
    payload: AddressPayload,
  ): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      await api.patch(`/user/me/addresses/${id}`, toRequestPayload(payload));
      return this.getAddresses();
    }

    const nextPayload = toRequestPayload(payload);
    const current = readLocal();
    const updated = current.map((a) => {
      if (a.id === id) return { ...a, ...nextPayload };
      if (nextPayload.isDefault) return { ...a, isDefault: false };
      return a;
    });

    writeLocal(updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      await api.delete(`/user/me/addresses/${id}`);
      return this.getAddresses();
    }

    const current = readLocal();
    const updated = current.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true };
    }

    writeLocal(updated);
    return updated;
  }

  async setDefaultAddress(id: string): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      await api.post(`/user/me/addresses/${id}/set-default`);
      return this.getAddresses();
    }

    const current = readLocal();
    const updated = current.map((a) => ({ ...a, isDefault: a.id === id }));
    writeLocal(updated);
    return updated;
  }
}

export const profileAddressesService = new ProfileAddressesService();
export default profileAddressesService;
