import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { extractError } from '@/lib/api';
import sellerPortalService from '@/services/sellerPortalService';
import type {
  OrderStatus,
  SellerAutoResponderConfig,
} from '@/types-new';

export const sellerPortalKeys = {
  all: ['sellerPortal'] as const,
  store: () => [...sellerPortalKeys.all, 'store'] as const,
  products: () => [...sellerPortalKeys.all, 'products'] as const,
  orders: () => [...sellerPortalKeys.all, 'orders'] as const,
  order: (id: string) => [...sellerPortalKeys.orders(), id] as const,
  wallet: () => [...sellerPortalKeys.all, 'wallet'] as const,
  walletTransactions: () => [...sellerPortalKeys.wallet(), 'transactions'] as const,
  autoResponder: () => [...sellerPortalKeys.all, 'autoResponder'] as const,
  settings: () => [...sellerPortalKeys.all, 'settings'] as const,
};

export function useSellerMyStore() {
  return useQuery({
    queryKey: sellerPortalKeys.store(),
    queryFn: () => sellerPortalService.getMyStore(),
  });
}

export function useSellerStoreProducts(storeId?: string) {
  return useQuery({
    queryKey: sellerPortalKeys.products(),
    queryFn: () => sellerPortalService.getStoreProducts(storeId),
  });
}

export function useSellerCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => sellerPortalService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.products() });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      sellerPortalService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.products() });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerPortalService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.products() });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerStoreOrders(storeId?: string) {
  return useQuery({
    queryKey: sellerPortalKeys.orders(),
    queryFn: () => sellerPortalService.getStoreOrders(storeId),
  });
}

export function useSellerOrder(id: string) {
  return useQuery({
    queryKey: sellerPortalKeys.order(id),
    queryFn: () => sellerPortalService.getOrder(id),
    enabled: !!id,
  });
}

export function useSellerUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      sellerPortalService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.orders() });
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.order(id) });
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerWallet() {
  return useQuery({
    queryKey: sellerPortalKeys.wallet(),
    queryFn: () => sellerPortalService.getWallet(),
  });
}

export function useSellerWalletTransactions() {
  return useQuery({
    queryKey: sellerPortalKeys.walletTransactions(),
    queryFn: () => sellerPortalService.getWalletTransactions(),
  });
}

export function useSellerWithdrawFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number; accountID: string }) =>
      sellerPortalService.withdrawFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.wallet() });
      queryClient.invalidateQueries({
        queryKey: sellerPortalKeys.walletTransactions(),
      });
      toast.success('Withdrawal request submitted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerAutoResponder() {
  return useQuery({
    queryKey: sellerPortalKeys.autoResponder(),
    queryFn: () => sellerPortalService.getAutoResponder(),
  });
}

export function useSellerUpdateAutoResponder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SellerAutoResponderConfig) =>
      sellerPortalService.updateAutoResponder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.autoResponder() });
      toast.success('Auto-responder settings updated');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerUpdateStoreProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { storeName: string; description: string }) =>
      sellerPortalService.updateStoreProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.store() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerUpdateStoreContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; phoneNumber: string }) =>
      sellerPortalService.updateStoreContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.store() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerUpdateStoreLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { hallId: string | null }) =>
      sellerPortalService.updateStoreLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.store() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerUpdateStorePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { notifyOnOrder: boolean }) =>
      sellerPortalService.updateStorePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.store() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

export function useSellerDeactivateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => sellerPortalService.deactivateStore(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPortalKeys.store() });
      toast.success('Store deactivated successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
