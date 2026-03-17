import { api, extractData } from '@/lib/api';
import type {
  Order,
  OrderStatus,
  Product,
  SellerAutoResponderConfig,
  SellerWallet,
  SellerWalletTransaction,
  Store,
} from '@/types-new';
import {
  normalizeSellerOrder,
  normalizeSellerOrderArray,
  normalizeSellerWallet,
  normalizeSellerWalletTransactionArray,
} from '@/types-new';

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeStore(rawStore: unknown): Store {
  const raw = (rawStore ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? ''),
    storeName: String(raw.storeName ?? raw.name ?? ''),
    storeSlug: String(raw.storeSlug ?? raw.slug ?? ''),
    description:
      raw.description === null || raw.description === undefined
        ? null
        : String(raw.description),
    logo: raw.logo ? String(raw.logo) : null,
    banner: raw.banner ? String(raw.banner) : null,
    email: String(raw.email ?? ''),
    phoneNumber: String(raw.phoneNumber ?? raw.phone ?? ''),
    status: (raw.status as Store['status']) ?? 'active',
    isVerified: Boolean(raw.isVerified ?? raw.verified ?? false),
    rating:
      raw.rating === null || raw.rating === undefined
        ? null
        : toNumber(raw.rating, 0),
    totalSales: toNumber(raw.totalSales ?? raw.total_sales, 0),
    totalOrders: toNumber(raw.totalOrders ?? raw.total_orders, 0),
    institutionID:
      raw.institutionID === null || raw.institutionID === undefined
        ? null
        : String(raw.institutionID),
    autoResponderEnabled: Boolean(
      raw.autoResponderEnabled ?? raw.auto_responder_enabled ?? false,
    ),
    autoResponderName:
      raw.autoResponderName === null || raw.autoResponderName === undefined
        ? null
        : String(raw.autoResponderName),
    dateCreated: String(raw.dateCreated ?? raw.date_created ?? ''),
  };
}

function normalizeProduct(rawProduct: unknown): Product {
  const raw = (rawProduct ?? {}) as Record<string, unknown>;
  const rawStore =
    raw.store && typeof raw.store === 'object'
      ? (raw.store as Record<string, unknown>)
      : null;

  return {
    id: String(raw.id ?? ''),
    storeID: String(raw.storeID ?? raw.store_id ?? ''),
    name: String(raw.name ?? raw.productName ?? raw.title ?? 'Untitled Product'),
    slug: String(raw.slug ?? ''),
    description: String(raw.description ?? ''),
    price: toNumber(raw.price ?? raw.unitPrice ?? raw.unit_price, 0),
    comparePrice:
      raw.comparePrice === null || raw.comparePrice === undefined
        ? raw.compare_price === null || raw.compare_price === undefined
          ? null
          : toNumber(raw.compare_price, 0)
        : toNumber(raw.comparePrice, 0),
    quantity: toNumber(raw.quantity ?? raw.stock ?? raw.inventory, 0),
    minOrderQuantity: toNumber(raw.minOrderQuantity ?? raw.min_order_quantity, 1),
    maxOrderQuantity:
      raw.maxOrderQuantity === null || raw.maxOrderQuantity === undefined
        ? raw.max_order_quantity === null || raw.max_order_quantity === undefined
          ? null
          : toNumber(raw.max_order_quantity, 0)
        : toNumber(raw.maxOrderQuantity, 0),
    images: Array.isArray(raw.images)
      ? raw.images.map(String)
      : typeof raw.thumbnail === 'string'
        ? [raw.thumbnail]
        : [],
    thumbnail: typeof raw.thumbnail === 'string' ? raw.thumbnail : null,
    category: String(raw.category ?? 'other') as Product['category'],
    condition: raw.condition as Product['condition'] | undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    status: (raw.status as Product['status']) ?? 'active',
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    isFeatured: Boolean(raw.isFeatured ?? raw.is_featured ?? false),
    rating:
      raw.rating === null || raw.rating === undefined
        ? null
        : toNumber(raw.rating, 0),
    reviewCount: toNumber(raw.reviewCount ?? raw.review_count, 0),
    soldCount: toNumber(raw.soldCount ?? raw.sold_count, 0),
    viewCount: toNumber(raw.viewCount ?? raw.view_count, 0),
    dateCreated: String(raw.dateCreated ?? raw.date_created ?? ''),
    store: rawStore
      ? {
          id: String(rawStore.id ?? ''),
          name: String(
            rawStore.name ?? rawStore.storeName ?? rawStore.store_name ?? '',
          ),
          slug: String(
            rawStore.slug ?? rawStore.storeSlug ?? rawStore.store_slug ?? '',
          ),
          logo:
            typeof rawStore.logo === 'string' ? rawStore.logo : undefined,
          location:
            typeof rawStore.location === 'string'
              ? rawStore.location
              : undefined,
          totalSales:
            rawStore.totalSales === null || rawStore.totalSales === undefined
              ? rawStore.total_sales === null || rawStore.total_sales === undefined
                ? undefined
                : toNumber(rawStore.total_sales, 0)
              : toNumber(rawStore.totalSales, 0),
        }
      : undefined,
  };
}

function unwrapItems(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw;
  const record = (raw ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeAutoResponder(rawValue: unknown): SellerAutoResponderConfig {
  const raw = (rawValue ?? {}) as Record<string, unknown>;
  const config =
    raw.config && typeof raw.config === 'object'
      ? (raw.config as Record<string, unknown>)
      : null;

  return {
    enabled: Boolean(raw.enabled ?? false),
    botName: String(raw.botName ?? raw.bot_name ?? raw.name ?? ''),
    message: String(raw.message ?? config?.greeting ?? ''),
  };
}

export interface SellerPortalService {
  getMyStore(): Promise<Store>;
  getStoreProducts(storeId?: string): Promise<Product[]>;
  createProduct(data: FormData): Promise<unknown>;
  updateProduct(id: string, data: FormData): Promise<unknown>;
  deleteProduct(id: string): Promise<void>;
  getStoreOrders(storeId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<unknown>;
  getWallet(): Promise<SellerWallet>;
  getWalletTransactions(): Promise<SellerWalletTransaction[]>;
  withdrawFunds(data: { amount: number; accountID: string }): Promise<unknown>;
  getAutoResponder(): Promise<SellerAutoResponderConfig>;
  updateAutoResponder(data: SellerAutoResponderConfig): Promise<unknown>;
}

export const sellerPortalService: SellerPortalService = {
  async getMyStore() {
    const response = await api.get('/store/my-store');
    const data = extractData<{ store?: unknown } | unknown>(response);
    return normalizeStore(
      data && typeof data === 'object' && 'store' in data ? data.store : data,
    );
  },

  async getStoreProducts(_storeId?: string) {
    const response = await api.get('/store/products');
    const data = extractData<unknown>(response);
    return unwrapItems(data, ['products', 'items', 'results']).map(normalizeProduct);
  },

  async createProduct(data: FormData) {
    const response = await api.post('/store/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
  },

  async updateProduct(id: string, data: FormData) {
    const response = await api.put(`/store/products/${id}`, data);
    return extractData(response);
  },

  async deleteProduct(id: string) {
    await api.delete(`/store/products/${id}`);
  },

  async getStoreOrders(_storeId?: string) {
    const response = await api.get('/store/orders');
    const data = extractData<{ orders?: unknown[]; items?: unknown[] } | unknown[]>(response);
    if (Array.isArray(data)) {
      return normalizeSellerOrderArray(data);
    }
    return normalizeSellerOrderArray(data.orders || data.items || []);
  },

  async getOrder(id: string) {
    const response = await api.get(`/store/orders/${id}`);
    const data = extractData<{ order?: unknown } | unknown>(response);
    return normalizeSellerOrder(
      data && typeof data === 'object' && 'order' in data ? data.order : data,
    );
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    if (status === 'processing') {
      const response = await api.post(`/store/orders/${id}/process`);
      return extractData(response);
    }

    if (status === 'shipped' || status === 'delivered' || status === 'completed') {
      const response = await api.post(`/store/orders/${id}/ship`);
      return extractData(response);
    }

    throw new Error(
      `Unsupported seller order status transition for current backend routes: ${status}`,
    );
  },

  async getWallet() {
    const response = await api.get('/store/wallet');
    const data = extractData<{ wallet?: unknown } | unknown>(response);
    const walletPayload =
      data && typeof data === 'object' && 'wallet' in data ? data.wallet : data;
    return normalizeSellerWallet(walletPayload);
  },

  async getWalletTransactions() {
    const response = await api.get('/store/wallet/transactions');
    const data = extractData<{ transactions?: unknown[]; items?: unknown[] } | unknown[]>(response);
    if (Array.isArray(data)) {
      return normalizeSellerWalletTransactionArray(data);
    }
    return normalizeSellerWalletTransactionArray(
      data.transactions || data.items || [],
    );
  },

  async withdrawFunds(data: { amount: number; accountID: string }) {
    const response = await api.post('/store/wallet/withdraw', {
      amount: data.amount,
      accountId: data.accountID,
    });
    return extractData(response);
  },

  async getAutoResponder() {
    const response = await api.get('/store/settings/auto-responder');
    const data = extractData<unknown>(response);
    return normalizeAutoResponder(data);
  },

  async updateAutoResponder(data: SellerAutoResponderConfig) {
    const response = await api.patch('/store/settings/auto-responder', {
      enabled: data.enabled,
      name: data.botName,
      config: {
        greeting: data.message,
      },
    });
    return extractData(response);
  },
};

export default sellerPortalService;
