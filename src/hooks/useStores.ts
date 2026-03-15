import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Store, Product, PaginatedResponse, Pagination } from '@/types-new';
import toast from 'react-hot-toast';

interface StoreFilters {
  search?: string;
  sort?: 'popular' | 'newest' | 'rating';
  institution?: string;
  page?: number;
  perPage?: number;
}

interface StoreProductsFilters {
  category?: string;
  sort?: 'newest' | 'price_low' | 'price_high' | 'popular';
  page?: number;
  perPage?: number;
}

// Store-related Query Keys
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters?: object) => [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
  bySlug: (slug: string) => [...storeKeys.all, 'slug', slug] as const,
  products: (storeIdentifier: string, filters?: object) =>
    [...storeKeys.all, 'products', storeIdentifier, filters] as const,
  my: () => [...storeKeys.all, 'my'] as const,
};

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

// Get all stores
export function useStores(filters: StoreFilters = {}) {
  return useQuery<PaginatedResponse<Store>>({
    queryKey: storeKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Store>> => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.institution) params.set('institution', filters.institution);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.perPage) params.set('per_page', String(filters.perPage));

      const response = await api.get(`/stores${params.toString() ? `?${params.toString()}` : ''}`);
      const data = extractData<{ stores?: unknown[]; pagination?: Pagination }>(response);
      const stores = Array.isArray(data?.stores)
        ? data.stores.map(normalizeStore)
        : [];

      return {
        items: stores,
        pagination: data?.pagination as Pagination,
        total: data?.pagination?.total ?? stores.length,
        pages: data?.pagination?.pages ?? 1,
        page: data?.pagination?.page ?? 1,
        hasNext: data?.pagination?.hasNext ?? false,
        hasPrev: data?.pagination?.hasPrev ?? false,
      };
    },
  });
}

// Get single store by ID
export function useStore(id: string) {
  return useQuery<Store>({
    queryKey: storeKeys.detail(id),
    queryFn: async (): Promise<Store> => {
      const response = await api.get(`/stores/${id}`);
      const data = extractData<{ store?: unknown }>(response);
      return normalizeStore(data?.store ?? data);
    },
    enabled: !!id,
  });
}

// Get store by slug
export function useStoreBySlug(slug: string) {
  return useQuery<Store>({
    queryKey: storeKeys.bySlug(slug),
    queryFn: async (): Promise<Store> => {
      // Backend accepts either store UUID or slug at GET /stores/:store_identifier
      const response = await api.get(`/stores/${slug}`);
      const data = extractData<{ store?: unknown }>(response);
      return normalizeStore(data?.store ?? data);
    },
    enabled: !!slug,
  });
}

export function useStoreProductsForStorePage(
  storeIdentifier: string,
  filters: StoreProductsFilters = {},
) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: storeKeys.products(storeIdentifier, filters),
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.perPage) params.set('per_page', String(filters.perPage));

      const response = await api.get(
        `/stores/${storeIdentifier}/products${params.toString() ? `?${params.toString()}` : ''}`,
      );
      const data = extractData<{
        products?: unknown[];
        pagination?: Pagination;
      }>(response);
      const products = Array.isArray(data?.products)
        ? data.products.map(normalizeProduct)
        : [];

      return {
        items: products,
        pagination: data?.pagination as Pagination,
        total: data?.pagination?.total ?? products.length,
        pages: data?.pagination?.pages ?? 1,
        page: data?.pagination?.page ?? 1,
        hasNext: data?.pagination?.hasNext ?? false,
        hasPrev: data?.pagination?.hasPrev ?? false,
      };
    },
    enabled: !!storeIdentifier,
  });
}

// Get merchant's own store
export function useMyStore() {
  return useQuery<Store>({
    queryKey: storeKeys.my(),
    queryFn: async (): Promise<Store> => {
      const response = await api.get('/stores/my');
      return extractData<Store>(response);
    },
  });
}

// Create store
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/stores', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      toast.success('Store created successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Update store details
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.put(`/stores/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      toast.success('Store updated successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
