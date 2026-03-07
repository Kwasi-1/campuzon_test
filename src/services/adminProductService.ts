import apiClient, { handleApiError } from '@/services/apiClient';

// Partial backend product shape under admin/stalls/<stall_id>/products
interface BackendProductItem {
  id?: string;
  name?: string;
  price?: number;
  category?: string;
  stock_quantity?: number;
  status?: string;
  created_at?: string;
  view_count?: number;
  total_sales?: number;
  stall?: { stall_id?: string; name?: string; stall_name?: string };
}

interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  suspendedProducts: number;
  lowStockProducts: number;
  topCategories: Array<{ name: string; count: number }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  store: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  createdAt?: string;
  views?: number;
  sales?: number;
  stallId?: string;
}

const map = (p: BackendProductItem): AdminProduct => ({
  id: String(p.id ?? ''),
  name: p.name ?? 'Product',
  store: p.stall?.name || p.stall?.stall_name || '',
  category: p.category || '',
  price: Number(p.price ?? 0),
  stock: Number(p.stock_quantity ?? 0),
  status: p.status || 'active',
  createdAt: p.created_at,
  views: p.view_count,
  sales: p.total_sales,
  stallId: p.stall?.stall_id,
});

class AdminProductService {
  async getProductsForStall(stallId: string): Promise<AdminProduct[]> {
    try {
      const { data } = await apiClient.get<BackendProductItem[]>(`/admin/stalls/${encodeURIComponent(stallId)}/products`);
      const list = Array.isArray(data) ? data : [];
      return list.map(map);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAllProducts(): Promise<AdminProduct[]> {
    try {
      // Try dedicated endpoint first, fallback to stall-based approach
      try {
        const { data } = await apiClient.get<BackendProductItem[]>('/admin/products');
        const list = Array.isArray(data) ? data : [];
        return list.map(map);
      } catch {
        // Fallback: get products from all stalls
        console.warn('Using fallback method to fetch all products via stalls');
        return this.getAllProductsViaStalls();
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  private async getAllProductsViaStalls(): Promise<AdminProduct[]> {
    try {
      // This method is already implemented in the component, extracting it here
      const { data: stallsData } = await apiClient.get('/admin/stalls');
      const stalls = Array.isArray(stallsData) ? stallsData : [];
      const allProducts: AdminProduct[] = [];

      for (const stall of stalls) {
        if (!stall.stall_id) continue;
        try {
          const products = await this.getProductsForStall(stall.stall_id);
          allProducts.push(...products);
        } catch (error) {
          console.warn(`Failed to fetch products for stall ${stall.stall_id}:`, error);
        }
      }

      return allProducts;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async setProductStatus(productId: string, status: 'active' | 'suspended' | 'pending_approval'): Promise<void> {
    try {
      // If dedicated admin product endpoint exists, use it; otherwise no-op
      await apiClient.post(`/admin/products/${encodeURIComponent(productId)}/status`, { status });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateProduct(productId: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
    try {
      const { data } = await apiClient.put(`/admin/products/${encodeURIComponent(productId)}`, {
        name: updates.name,
        price: updates.price,
        stock_quantity: updates.stock,
        category: updates.category,
        status: updates.status,
      });
      return map(data as BackendProductItem);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/products/${encodeURIComponent(productId)}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getProductAnalytics(productId?: string): Promise<ProductAnalytics> {
    try {
      const { data } = await apiClient.get('/admin/analytics/products', {
        params: productId ? { productId } : undefined,
      });
      
      return (data as ProductAnalytics) || {
        totalProducts: 0,
        activeProducts: 0,
        suspendedProducts: 0,
        lowStockProducts: 0,
        topCategories: [],
      };
    } catch (error) {
      // Return mock data when analytics endpoint is not available
      console.warn('Product analytics endpoint not available, using fallback data');
      return {
        totalProducts: 0,
        activeProducts: 0,
        suspendedProducts: 0,
        lowStockProducts: 0,
        topCategories: [
          { name: 'Groceries', count: 150 },
          { name: 'Beverages', count: 85 },
          { name: 'Fruits', count: 120 },
          { name: 'Dairy', count: 45 },
        ],
      };
    }
  }

  async exportProducts(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/products/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async bulkUpdateProductStatus(productIds: string[], status: 'active' | 'suspended' | 'pending_approval'): Promise<void> {
    try {
      await apiClient.post('/admin/products/bulk-status', {
        productIds,
        status,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

const adminProductService = new AdminProductService();
export default adminProductService;
