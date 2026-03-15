import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Order, OrderStatus, CreateOrderRequest } from '@/types-new';
import toast from 'react-hot-toast';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  myOrders: () => [...orderKeys.all, 'my'] as const,
  storeOrders: (storeId: string) => [...orderKeys.all, 'store', storeId] as const,
};

// Get my orders
export function useMyOrders(filters?: Record<string, unknown>) {
  return useQuery<Order[]>({
    queryKey: orderKeys.list(filters),
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get('/orders', { params: filters });
      const data = extractData<{ orders?: Order[]; items?: Order[] } | Order[]>(response);
      return Array.isArray(data) ? data : data.orders || data.items || [];
    },
  });
}

// Get single order
export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: orderKeys.detail(id),
    queryFn: async (): Promise<Order> => {
      const response = await api.get(`/orders/${id}`);
      return extractData<Order>(response);
    },
    enabled: !!id,
  });
}

// Get store orders (for sellers)
export function useStoreOrders(storeId: string) {
  return useQuery<Order[]>({
    queryKey: orderKeys.storeOrders(storeId),
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get(`/stores/${storeId}/orders`);
      const data = extractData<{ orders?: Order[]; items?: Order[] } | Order[]>(response);
      return Array.isArray(data) ? data : data.orders || data.items || [];
    },
    enabled: !!storeId,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await api.post('/orders', data);
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Update order status (for sellers)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return extractData(response);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Confirm delivery (for buyers)
export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/confirm-delivery`);
      return extractData(response);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Delivery confirmed! Funds released to seller.');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Dispute order (was Request refund, but backend uses dispute)
export function useDisputeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason, description }: { orderId: string; reason: string; description: string }) => {
      const response = await api.post(`/orders/${orderId}/dispute`, { reason, description });
      return extractData(response);
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Dispute submitted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return extractData(response);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Order cancelled');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Release funds early (for buyers)
export function useReleaseFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/release-funds`);
      return extractData(response);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Funds released to seller! Order completed.');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
