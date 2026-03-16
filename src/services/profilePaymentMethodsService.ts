import api, { extractData } from "@/lib/api";

export type PaymentMethodType = "mobile_money" | "card";

export interface ProfilePaymentMethod {
  id: string;
  type: PaymentMethodType;
  provider: string;
  last4: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
}

interface MobileMoneyPayload {
  providerId: string;
  phoneNumber: string;
  isDefault: boolean;
}

const STORAGE_KEY = "campuzon_profile_payment_methods";
const ENABLE_REMOTE_PAYMENT_METHODS =
  import.meta.env.VITE_ENABLE_PROFILE_PAYMENT_METHODS_API === "true";

const PROVIDER_MAP: Record<string, string> = {
  mtn: "MTN Mobile Money",
  vodafone: "Vodafone Cash",
  airteltigo: "AirtelTigo Money",
};

const defaultPaymentMethods: ProfilePaymentMethod[] = [
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

const normalizeDefault = (items: ProfilePaymentMethod[]) => {
  if (items.length === 0) return items;

  const hasDefault = items.some((m) => m.isDefault);
  if (!hasDefault) {
    return items.map((m, index) => ({ ...m, isDefault: index === 0 }));
  }

  let seenDefault = false;
  return items.map((m) => {
    if (!m.isDefault) return m;
    if (!seenDefault) {
      seenDefault = true;
      return m;
    }
    return { ...m, isDefault: false };
  });
};

const readLocal = (): ProfilePaymentMethod[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPaymentMethods;

  try {
    const parsed = JSON.parse(raw) as ProfilePaymentMethod[];
    return normalizeDefault(parsed);
  } catch {
    return defaultPaymentMethods;
  }
};

const writeLocal = (items: ProfilePaymentMethod[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDefault(items)));
};

class ProfilePaymentMethodsService {
  async getPaymentMethods(): Promise<ProfilePaymentMethod[]> {
    if (ENABLE_REMOTE_PAYMENT_METHODS) {
      const response = await api.get("/user/me/payment-methods");
      const data = extractData<
        { paymentMethods?: ProfilePaymentMethod[] } | ProfilePaymentMethod[]
      >(response);
      const items = Array.isArray(data) ? data : data.paymentMethods || [];
      return normalizeDefault(items);
    }

    const items = readLocal();
    writeLocal(items);
    return items;
  }

  async createMobileMoneyMethod(
    payload: MobileMoneyPayload,
  ): Promise<ProfilePaymentMethod[]> {
    if (ENABLE_REMOTE_PAYMENT_METHODS) {
      const response = await api.post("/user/me/payment-methods/mobile-money", {
        providerId: payload.providerId,
        phoneNumber: payload.phoneNumber,
        isDefault: payload.isDefault,
      });
      const data = extractData<
        { paymentMethods?: ProfilePaymentMethod[] } | ProfilePaymentMethod[]
      >(response);
      return Array.isArray(data) ? data : data.paymentMethods || [];
    }

    const nextMethod: ProfilePaymentMethod = {
      id: `pm-${Date.now()}`,
      type: "mobile_money",
      provider: PROVIDER_MAP[payload.providerId] || "Mobile Money",
      last4: payload.phoneNumber.slice(-4),
      isDefault: payload.isDefault,
    };

    const current = readLocal();
    const updated = payload.isDefault
      ? [...current.map((m) => ({ ...m, isDefault: false })), nextMethod]
      : [...current, nextMethod];

    writeLocal(updated);
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<ProfilePaymentMethod[]> {
    if (ENABLE_REMOTE_PAYMENT_METHODS) {
      const response = await api.delete(`/user/me/payment-methods/${id}`);
      const data = extractData<
        { paymentMethods?: ProfilePaymentMethod[] } | ProfilePaymentMethod[]
      >(response);
      return Array.isArray(data) ? data : data.paymentMethods || [];
    }

    const current = readLocal();
    const updated = current.filter((m) => m.id !== id);
    writeLocal(updated);
    return normalizeDefault(updated);
  }

  async setDefaultPaymentMethod(id: string): Promise<ProfilePaymentMethod[]> {
    if (ENABLE_REMOTE_PAYMENT_METHODS) {
      const response = await api.patch(`/user/me/payment-methods/${id}/set-default`);
      const data = extractData<
        { paymentMethods?: ProfilePaymentMethod[] } | ProfilePaymentMethod[]
      >(response);
      return Array.isArray(data) ? data : data.paymentMethods || [];
    }

    const current = readLocal();
    const updated = current.map((m) => ({ ...m, isDefault: m.id === id }));
    writeLocal(updated);
    return updated;
  }
}

export const profilePaymentMethodsService = new ProfilePaymentMethodsService();
export default profilePaymentMethodsService;
