import apiClient, { handleApiError } from './apiClient';
import { Store } from '@/types';

interface BackendPagination {
  page: number;
  per_page?: number;
  total: number;
  total_pages?: number;
}

interface BackendStallItem {
  id: string;
  stall_name: string;
  stall_id: string;
  description?: string;
  category?: string;
  subcategory?: string;
  logo_url?: string;
  banner_url?: string;
  is_verified?: boolean;
  is_featured?: boolean;
  average_rating?: number;
  total_reviews?: number;
  total_products?: number;
}

interface BackendBrowseStallsResponse {
  success: boolean;
  stalls?: BackendStallItem[];
  data?: BackendStallItem[];
  pagination?: BackendPagination;
  error?: string;
  message?: string;
}

export interface BrowseStallsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'created_at' | 'rating' | 'popularity' | 'orders';
  featured?: boolean;
}

class PublicStallService {
  async browse(params: BrowseStallsParams = {}): Promise<{
    stores: Store[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.append('page', String(params.page));
      if (params.limit) sp.append('per_page', String(params.limit));
      if (params.category) sp.append('category', params.category);
      if (params.search) sp.append('search', params.search);
      if (params.sortBy) sp.append('sort_by', params.sortBy);
      if (params.featured !== undefined) sp.append('featured', String(params.featured));

      const { data } = await apiClient.get<BackendBrowseStallsResponse>(`/stalls/browse?${sp.toString()}`);

      if (!data?.success) {
        throw new Error(data?.message || data?.error || 'Failed to browse stores');
      }

      const list = (data.stalls || data.data || []) as BackendStallItem[];
      const stores: Store[] = list.map((s) => ({
        name: s.stall_name,
        logo: s.logo_url,
        fallbackIcon: 'mdi:store',
        products: s.total_products || 0,
        description: s.description || '',
        rating: s.average_rating,
        // Extend type with stallId for filtering products by stall
        stallId: s.stall_id,
      } as Store));

      const pag = data.pagination;
      const pagination = pag
        ? {
            page: Number(pag.page) || 1,
            limit: Number(pag.per_page) || (params.limit ?? 20),
            total: Number(pag.total) || stores.length,
            totalPages: Number(pag.total_pages) || 1,
          }
        : undefined;

      return { stores, pagination };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const publicStallService = new PublicStallService();
