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


class ProfileAddressesService {
  async getAddresses(): Promise<ProfileAddress[]> {
      const response = await api.get("/user/me/addresses");
      const data = extractData<unknown>(response);
      return toAddressList(data);
    }


  async createAddress(payload: AddressPayload): Promise<ProfileAddress[]> {
      await api.post("/user/me/addresses", toRequestPayload(payload));
      return this.getAddresses();
    }

  async updateAddress(
    id: string,
    payload: AddressPayload,
  ): Promise<ProfileAddress[]> {
      await api.patch(`/user/me/addresses/${id}`, toRequestPayload(payload));
      return this.getAddresses();
    }


  async deleteAddress(id: string): Promise<ProfileAddress[]>{
      await api.delete(`/user/me/addresses/${id}`);
      return this.getAddresses();
    }


  async setDefaultAddress(id: string): Promise<ProfileAddress[]> {
      await api.post(`/user/me/addresses/${id}/set-default`);
      return this.getAddresses();
    }
}

export const profileAddressesService = new ProfileAddressesService();
export default profileAddressesService;
