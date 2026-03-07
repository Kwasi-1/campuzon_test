import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Store } from '@/types-new';
import toast from 'react-hot-toast';

// Store-related Query Keys
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
  bySlug: (slug: string) => [...storeKeys.all, 'slug', slug] as const,
  my: () => [...storeKeys.all, 'my'] as const,
};

// Get all stores
export function useStores() {
  return useQuery<Store[]>({
    queryKey: storeKeys.lists(),
    queryFn: async (): Promise<Store[]> => {
      const response = await api.get('/stores');
      return extractData<Store[]>(response);
    },
  });
}

// Get single store by ID
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

// Get store by slug
export function useStoreBySlug(slug: string) {
  return useQuery<Store>({
    queryKey: storeKeys.bySlug(slug),
    queryFn: async (): Promise<Store> => {
      // Backend should support fetching by slug at GET /stores/slug/:slug
      const response = await api.get(`/stores/slug/${slug}`);
      return extractData<Store>(response);
    },
    enabled: !!slug,
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
