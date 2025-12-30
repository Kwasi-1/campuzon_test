import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import { mockApi } from '@/lib/mockData';
import type { Product, Store, PaginatedResponse, ProductFilters } from '@/types';
import toast from 'react-hot-toast';

// Use mock data in development when API is unavailable
const USE_MOCK = true; // Set to false when backend is running

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
      return extractData<PaginatedResponse<Product>>(response);
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
      return extractData<Product>(response);
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
      return extractData<Product[]>(response);
    },
    enabled: !!storeId,
  });
}

// Search products
export function useSearchProducts(query: string) {
  return useQuery<Product[]>({
    queryKey: productKeys.search(query),
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return extractData<Product[]>(response);
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

// Store-related hooks
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
  bySlug: (slug: string) => [...storeKeys.all, 'slug', slug] as const,
  my: () => [...storeKeys.all, 'my'] as const,
};

export function useStores() {
  return useQuery<Store[]>({
    queryKey: storeKeys.lists(),
    queryFn: async (): Promise<Store[]> => {
      const response = await api.get('/stores');
      return extractData<Store[]>(response);
    },
  });
}

export function useStore(id: string) {
  return useQuery<Store>({
    queryKey: storeKeys.detail(id),
    queryFn: async (): Promise<Store> => {
      const response = await api.get(`/stores/${id}`);
      return extractData<Store>(response);
    },
    enabled: !!id,
  });
}

export function useStoreBySlug(slug: string) {
  return useQuery<Store>({
    queryKey: storeKeys.bySlug(slug),
    queryFn: async (): Promise<Store> => {
      const response = await api.get(`/stores/slug/${slug}`);
      return extractData<Store>(response);
    },
    enabled: !!slug,
  });
}

export function useMyStore() {
  return useQuery<Store>({
    queryKey: storeKeys.my(),
    queryFn: async (): Promise<Store> => {
      const response = await api.get('/stores/my');
      return extractData<Store>(response);
    },
  });
}

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
