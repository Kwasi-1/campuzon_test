import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import { mockApi } from '@/lib/mockData';
import type { Product, Store, PaginatedResponse, ProductFilters, Pagination } from '@/types-new';
import toast from 'react-hot-toast';

// Use mock data in development when API is unavailable
const USE_MOCK = false; // Set to false when backend is running

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byStore: (storeId: string) => [...productKeys.all, 'store', storeId] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeProduct(rawProduct: unknown): Product {
  const raw = (rawProduct ?? {}) as Record<string, unknown>;
  const rawStore =
    raw.store && typeof raw.store === 'object'
      ? (raw.store as Record<string, unknown>)
      : null;

  const comparePriceValue =
    raw.comparePrice ?? raw.compare_price ?? raw.originalPrice ?? null;
  const maxOrderQuantityValue =
    raw.maxOrderQuantity ?? raw.max_order_quantity ?? null;

  return {
    id: String(raw.id ?? ''),
    storeID: String(raw.storeID ?? raw.store_id ?? ''),
    name: String(raw.name ?? raw.productName ?? raw.title ?? 'Untitled Product'),
    slug: String(raw.slug ?? ''),
    description: String(raw.description ?? ''),
    price: toNumber(raw.price ?? raw.unitPrice ?? raw.unit_price, 0),
    comparePrice:
      comparePriceValue === null || comparePriceValue === undefined
        ? null
        : toNumber(comparePriceValue, 0),
    quantity: toNumber(raw.quantity ?? raw.stock ?? raw.inventory, 0),
    minOrderQuantity: toNumber(
      raw.minOrderQuantity ?? raw.min_order_quantity,
      1,
    ),
    maxOrderQuantity:
      maxOrderQuantityValue === null || maxOrderQuantityValue === undefined
        ? null
        : toNumber(maxOrderQuantityValue, 0),
    images: Array.isArray(raw.images)
      ? raw.images.map(String)
      : typeof raw.thumbnail === 'string'
        ? [raw.thumbnail]
        : typeof raw.primary_image === 'string'
          ? [raw.primary_image]
          : [],
    thumbnail:
      typeof raw.thumbnail === 'string'
        ? raw.thumbnail
        : typeof raw.primary_image === 'string'
          ? raw.primary_image
          : null,
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

function unwrapProduct(rawData: unknown): Product | null {
  if (!rawData) return null;
  const record = rawData as Record<string, unknown>;
  return normalizeProduct(record.product ?? record.item ?? rawData);
}

function unwrapProductArray(rawData: unknown): Product[] {
  if (Array.isArray(rawData)) {
    return rawData.map(normalizeProduct);
  }

  const record = (rawData ?? {}) as Record<string, unknown>;
  const items = record.products ?? record.items ?? record.results ?? [];
  return Array.isArray(items) ? items.map(normalizeProduct) : [];
}

// Get all products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: productKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      if (USE_MOCK) {
        return mockApi.getProducts(filters);
      }
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.perPage) params.set('per_page', String(filters.perPage));
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('min_price', String(filters.minPrice));
      if (filters.maxPrice) params.set('max_price', String(filters.maxPrice));
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sort_by', filters.sortBy);
      if (filters.sortOrder) params.set('sort_order', filters.sortOrder);
      if (filters.storeId) params.set('store_id', filters.storeId);

      const response = await api.get(`/products?${params.toString()}`);
      const data = extractData<{ pagination?: Pagination; products?: unknown[]; items?: unknown[] }>(response);
      const products = unwrapProductArray(data);
      const pagination = data.pagination;
      return {
        items: products,
        pagination,
        total: pagination?.total ?? products.length,
        pages: pagination?.pages ?? 1,
        page: pagination?.page ?? 1,
        hasNext: pagination?.hasNext ?? false,
        hasPrev: pagination?.hasPrev ?? false,
      };
    },
  });
}

// Get single product
export function useProduct(id: string) {
  return useQuery<Product | null>({
    queryKey: productKeys.detail(id),
    queryFn: async (): Promise<Product | null> => {
      if (USE_MOCK) {
        return mockApi.getProduct(id);
      }
      const response = await api.get(`/products/${id}`);
      return unwrapProduct(extractData<unknown>(response) ?? response.data);
    },
    enabled: !!id,
  });
}

// Get products by store
export function useStoreProducts(storeId: string) {
  return useQuery<Product[]>({
    queryKey: productKeys.byStore(storeId),
    queryFn: async (): Promise<Product[]> => {
      if (USE_MOCK) {
        return mockApi.getStoreProducts(storeId);
      }
      const response = await api.get(`/stores/${storeId}/products`);
      return unwrapProductArray(extractData<unknown>(response) ?? response.data);
    },
    enabled: !!storeId,
  });
}

// Search products
export function useSearchProducts(query: string) {
  return useQuery<Product[]>({
    queryKey: productKeys.search(query),
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
      const data = extractData<{ products?: unknown[]; items?: unknown[] }>(response);
      return unwrapProductArray(data);
    },
    enabled: query.length >= 2,
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}


