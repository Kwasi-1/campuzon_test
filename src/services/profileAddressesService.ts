import api, { extractData } from "@/lib/api";

export type AddressType = "hall" | "home" | "other";

export interface ProfileAddress {
  id: string;
  label: string;
  fullAddress: string;
  hall?: string;
  room?: string;
  phone?: string;
  isDefault: boolean;
  type: AddressType;
}

interface AddressPayload {
  label: string;
  fullAddress: string;
  hall?: string;
  room?: string;
  phone?: string;
  isDefault: boolean;
  type: AddressType;
}

const STORAGE_KEY = "campuzon_profile_addresses";
const ENABLE_REMOTE_ADDRESSES =
  import.meta.env.VITE_ENABLE_PROFILE_ADDRESSES_API === "true";

const defaultAddresses: ProfileAddress[] = [
  {
    id: "addr-1",
    label: "My Hall",
    fullAddress: "Legon Hall, Room A101",
    hall: "Legon Hall",
    room: "A101",
    phone: "+233 24 123 4567",
    isDefault: true,
    type: "hall",
  },
  {
    id: "addr-2",
    label: "Home",
    fullAddress: "15 Independence Avenue, Accra",
    phone: "+233 20 987 6543",
    isDefault: false,
    type: "home",
  },
];

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
    const parsed = JSON.parse(raw) as ProfileAddress[];
    return ensureSingleDefault(parsed);
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
      const data = extractData<{ addresses?: ProfileAddress[] } | ProfileAddress[]>(
        response,
      );
      const items = Array.isArray(data) ? data : data.addresses || [];
      return ensureSingleDefault(items);
    }

    const items = readLocal();
    writeLocal(items);
    return items;
  }

  async createAddress(payload: AddressPayload): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      const response = await api.post("/user/me/addresses", payload);
      const data = extractData<{ addresses?: ProfileAddress[] } | ProfileAddress[]>(
        response,
      );
      return Array.isArray(data) ? data : data.addresses || [];
    }

    const nextAddress: ProfileAddress = {
      id: `addr-${Date.now()}`,
      ...payload,
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
      const response = await api.patch(`/user/me/addresses/${id}`, payload);
      const data = extractData<{ addresses?: ProfileAddress[] } | ProfileAddress[]>(
        response,
      );
      return Array.isArray(data) ? data : data.addresses || [];
    }

    const current = readLocal();
    const updated = current.map((a) => {
      if (a.id === id) return { ...a, ...payload };
      if (payload.isDefault) return { ...a, isDefault: false };
      return a;
    });

    writeLocal(updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<ProfileAddress[]> {
    if (ENABLE_REMOTE_ADDRESSES) {
      const response = await api.delete(`/user/me/addresses/${id}`);
      const data = extractData<{ addresses?: ProfileAddress[] } | ProfileAddress[]>(
        response,
      );
      return Array.isArray(data) ? data : data.addresses || [];
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
      const response = await api.post(`/user/me/addresses/${id}/set-default`);
      const data = extractData<{ addresses?: ProfileAddress[] } | ProfileAddress[]>(
        response,
      );
      return Array.isArray(data) ? data : data.addresses || [];
    }

    const current = readLocal();
    const updated = current.map((a) => ({ ...a, isDefault: a.id === id }));
    writeLocal(updated);
    return updated;
  }
}

export const profileAddressesService = new ProfileAddressesService();
export default profileAddressesService;
