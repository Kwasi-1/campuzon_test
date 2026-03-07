/**
 * Saved Items (Shopping List) Service
 *
 * Integrates with backend saved-items endpoints for authenticated users.
 */

import apiClient, { ApiResponse, handleApiError } from './apiClient';
import { Product } from '@/types';

type BackendSavedItem = {
  id: string;
  name: string;
  price: number;
  stall_name?: string;
  image_url?: string | null;
  is_in_stock?: boolean;
};

class SavedItemsService {
  async getSavedItems(): Promise<Product[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<{ saved_items: BackendSavedItem[] }>>(
        '/user/account/saved-items'
      );
      if (data.success && data.data) {
        const items = data.data.saved_items || [];
        return items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          image: i.image_url || '/placeholder.svg',
          inStock: i.is_in_stock ?? true,
          store: i.stall_name || 'Unknown Stall',
          category: 'General',
        }));
      }
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async add(productId: string | number): Promise<void> {
    try {
      const { data } = await apiClient.post<ApiResponse>('/user/account/saved-items/add', {
        product_id: productId,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to add to saved items');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async remove(productId: string | number): Promise<void> {
    try {
      const { data } = await apiClient.post<ApiResponse>('/user/account/saved-items/remove', {
        product_id: productId,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to remove from saved items');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const savedItemsService = new SavedItemsService();
export default savedItemsService;
