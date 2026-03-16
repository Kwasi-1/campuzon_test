import api, { extractData } from "@/lib/api";

export interface CreateStorePayload {
  storeName: string;
  email: string;
  phoneNumber: string;
  additionalNumber?: string;
  description?: string;
}

export interface SellerStoreRecord extends Record<string, unknown> {
  id?: string;
  storeName?: string;
  storeSlug?: string;
  status?: string;
}

class SellerOnboardingService {
  async createStore(payload: CreateStorePayload): Promise<SellerStoreRecord> {
    const response = await api.post("/store/create", payload);
    const data = extractData<{ store?: SellerStoreRecord }>(response);
    return data.store ?? {};
  }
}

export const sellerOnboardingService = new SellerOnboardingService();
export default sellerOnboardingService;