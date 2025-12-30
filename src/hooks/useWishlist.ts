import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

// Query Keys
export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: () => [...wishlistKeys.all, 'list'] as const,
  check: (productId: string) => [...wishlistKeys.all, 'check', productId] as const,
};

// Get wishlist
export function useWishlist() {
  return useQuery<Product[]>({
    queryKey: wishlistKeys.list(),
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get('/wishlist');
      return extractData<Product[]>(response);
    },
  });
}

// Check if product is in wishlist
export function useIsInWishlist(productId: string) {
  return useQuery<boolean>({
    queryKey: wishlistKeys.check(productId),
    queryFn: async (): Promise<boolean> => {
      const response = await api.get(`/wishlist/check/${productId}`);
      return extractData<boolean>(response);
    },
    enabled: !!productId,
  });
}

// Add to wishlist
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.post('/wishlist', { productId });
      return extractData(response);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      queryClient.setQueryData(wishlistKeys.check(productId), true);
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Remove from wishlist
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      queryClient.setQueryData(wishlistKeys.check(productId), false);
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Toggle wishlist
export function useToggleWishlist() {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const toggle = async (productId: string, isInWishlist: boolean) => {
    if (isInWishlist) {
      await removeFromWishlist.mutateAsync(productId);
    } else {
      await addToWishlist.mutateAsync(productId);
    }
  };

  return {
    toggle,
    isLoading: addToWishlist.isPending || removeFromWishlist.isPending,
  };
}
