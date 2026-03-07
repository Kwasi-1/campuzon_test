import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  sellerResponse?: string;
  dateCreated: string;
  product?: {
    id: string;
    name: string;
    thumbnail: string;
  };
  store?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    displayName: string;
    profileImage: string;
  };
}

export interface CreateReviewData {
  orderID: string;
  productID: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

const reviewKeys = {
  all: ['reviews'] as const,
  my: () => [...reviewKeys.all, 'my'] as const,
  pending: () => [...reviewKeys.all, 'pending'] as const,
  byProduct: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
};

export function useMyReviews() {
  return useQuery({
    queryKey: reviewKeys.my(),
    queryFn: async () => {
      const response = await api.get('/reviews/my-reviews');
      return extractData<{ reviews: Review[] }>(response);
    },
  });
}

export function usePendingReviews() {
  return useQuery({
    queryKey: reviewKeys.pending(),
    queryFn: async () => {
      const response = await api.get('/reviews/pending');
      return extractData<{ orders: any[] }>(response);
    },
  });
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/reviews`);
      return extractData<{ reviews: Review[] }>(response);
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await api.post('/reviews', data);
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
