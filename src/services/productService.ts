/**
 * Product Service
 * 
 * Handles all product-related API calls including fetching products,
 * searching, filtering, and product details.
 */

import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from './apiClient';
import { Product, Category } from '@/types';

// Backend payload types (partial, with only fields we use)
interface BackendStall {
  name?: string;
  stall_name?: string;
}

interface BackendProduct {
  id: string | number;
  name: string;
  price?: number;
  compare_price?: number;
  discount_percentage?: number;
  average_rating?: number;
  primary_image?: string;
  stall?: BackendStall;
  category?: string;
  short_description?: string;
  description?: string;
  is_in_stock?: boolean;
}

interface BackendPagination {
  page: number;
  per_page?: number;
  limit?: number;
  total: number;
  total_pages?: number;
  pages?: number;
}

interface BackendBaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface BackendBrowseResponse extends BackendBaseResponse {
  products?: BackendProduct[];
  data?: BackendProduct[];
  pagination?: BackendPagination;
}

interface BackendSearchResponse extends BackendBaseResponse {
  results?: BackendProduct[];
  data?: BackendProduct[];
  pagination?: BackendPagination;
}

interface BackendSingleProductResponse extends BackendBaseResponse {
  product?: BackendProduct;
  data?: BackendProduct;
}

interface BackendListWrapper extends BackendBaseResponse {
  featured_products?: BackendProduct[];
  popular_products?: BackendProduct[];
  recent_products?: BackendProduct[];
  related_products?: BackendProduct[];
  data?: BackendProduct[];
}

interface BackendVariantsResponse extends BackendBaseResponse {
  variants?: ProductVariant[];
  data?: ProductVariant[];
}

interface BackendAvailabilityResponse extends BackendBaseResponse {
  is_in_stock?: boolean;
  data?: { is_in_stock?: boolean };
}

interface BackendPricePoint { date: string; price: number }

interface BackendPriceHistoryResponse extends BackendBaseResponse {
  price_history?: BackendPricePoint[];
  data?: BackendPricePoint[];
}

interface BackendCategory {
  name: string;
  icon_url?: string;
  product_count?: number;
  image_url?: string;
}

// Map backend product payload to our frontend Product type
const mapBackendProductToProduct = (p: BackendProduct): Product => {
  const price: number = p.price ?? 0;
  const compare = p.compare_price ?? undefined;
  const discountPct = p.discount_percentage ?? undefined;
  const hasDiscount = typeof discountPct === 'number' ? discountPct > 0 : (compare ? compare > price : false);
  return {
    id: p.id,
    name: p.name,
    price,
    originalPrice: compare,
    discount: typeof discountPct === 'number' ? discountPct : undefined,
    rating: p.average_rating,
    image: p.primary_image,
    store: p.stall?.name || p.stall?.stall_name || '',
    category: p.category || '',
    description: p.short_description || p.description,
    inStock: typeof p.is_in_stock === 'boolean' ? p.is_in_stock : undefined,
    hasDiscount,
  };
};

// Product service types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  store?: string;
  stallId?: string;
  inStock?: boolean;
  hasDiscount?: boolean;
}

export interface ProductSearchParams extends ProductFilters {
  q?: string; // search query
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface PriceHistory {
  date: string;
  price: number;
}

/**
 * Product Service Class
 */
class ProductService {
  /**
   * Browse products with pagination and filters
   */
  async getProducts(params: ProductSearchParams = {}): Promise<{
    products: Product[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('per_page', params.limit.toString());
      
      // Add filters
      if (params.category) searchParams.append('category', params.category);
      if (params.minPrice) searchParams.append('min_price', params.minPrice.toString());
      if (params.maxPrice) searchParams.append('max_price', params.maxPrice.toString());
  // store (by name) not supported server-side; if stall_id is available we send it
  if (params.stallId) searchParams.append('stall_id', params.stallId);
      if (params.inStock !== undefined) searchParams.append('in_stock', params.inStock.toString());
      // Treat hasDiscount as featured products in backend
      if (params.hasDiscount !== undefined) searchParams.append('featured', params.hasDiscount.toString());
      
      // Add sorting
      if (params.sortBy) {
        const so = params.sortOrder || 'desc';
        let backendSort = 'created_at';
        if (params.sortBy === 'price') backendSort = so === 'asc' ? 'price_low' : 'price_high';
        else if (params.sortBy === 'name') backendSort = 'name';
        else if (params.sortBy === 'rating') backendSort = 'rating';
        else if (params.sortBy === 'date') backendSort = 'created_at';
        searchParams.append('sort_by', backendSort);
      }

      const response = await apiClient.get<BackendBrowseResponse>(
        `/product/browse?${searchParams.toString()}`
      );
      const body = response.data;
      if (body?.success) {
        const items = (body.products || body.data || []).map((p) => mapBackendProductToProduct(p));
        const pag = body.pagination;
        const pagination: { page: number; limit: number; total: number; totalPages: number } | undefined = pag
          ? {
              page: Number(pag.page) || params.page || 1,
              limit: Number(pag.per_page ?? pag.limit ?? params.limit ?? 12),
              total: Number(pag.total) || items.length,
              totalPages: Number(pag.total_pages ?? pag.pages) || 1,
            }
          : undefined;
        return { products: items, pagination };
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams({ q: query });
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'minPrice') searchParams.append('min_price', String(value));
          else if (key === 'maxPrice') searchParams.append('max_price', String(value));
          else if (key === 'inStock') searchParams.append('in_stock', String(value));
          else if (key === 'hasDiscount') searchParams.append('featured', String(value));
          else if (key === 'category') searchParams.append('category', String(value));
          else if (key === 'stallId') searchParams.append('stall_id', String(value));
        }
      });

      const response = await apiClient.get<BackendSearchResponse>(
        `/product/search?${searchParams.toString()}`
      );
      const body = response.data;
      if (body?.success) {
        const list = body.results || body.data || [];
        return list.map((p) => mapBackendProductToProduct(p));
      }

      throw new Error(body?.message || body?.error || 'Search failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product details by ID
   */
  async getProductById(productId: number | string): Promise<Product> {
    try {
      const response = await apiClient.get<BackendSingleProductResponse>(`/product/${productId}`);
      const body = response.data;
      if (body?.success && (body.product || body.data)) {
        return mapBackendProductToProduct((body.product || body.data)!);
      }

      throw new Error(body?.message || body?.error || 'Product not found');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<BackendBaseResponse & { categories?: BackendCategory[]; data?: BackendCategory[] }>(
        '/product/categories'
      );
      const body = response.data;
      if (body?.success) {
        const cats: BackendCategory[] = (body.categories ?? body.data ?? []) as BackendCategory[];
        return cats.map((c) => ({
          name: c.name,
          icon: c.icon_url || 'ph:tag',
          count: c.product_count || 0,
          image: c.image_url,
        })) as Category[];
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch categories');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get<BackendListWrapper>(`/product/featured${params}`);
      const body = response.data;
      if (body?.success) {
        return (body.featured_products || body.data || []).map((p) => mapBackendProductToProduct(p));
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch featured products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get popular products
   */
  async getPopularProducts(limit?: number): Promise<Product[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get<BackendListWrapper>(`/product/popular${params}`);
      const body = response.data;
      if (body?.success) {
        return (body.popular_products || body.data || []).map((p) => mapBackendProductToProduct(p));
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch popular products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get recently added products
   */
  async getRecentProducts(limit?: number): Promise<Product[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get<BackendListWrapper>(`/product/recent${params}`);
      const body = response.data;
      if (body?.success) {
        return (body.recent_products || body.data || []).map((p) => mapBackendProductToProduct(p));
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch recent products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get related products for a product
   */
  async getRelatedProducts(productId: number | string, limit?: number): Promise<Product[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get<BackendListWrapper>(
        `/product/related/${productId}${params}`
      );
      const body = response.data;
      if (body?.success) {
        return (body.related_products || body.data || []).map((p) => mapBackendProductToProduct(p));
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch related products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product variants
   */
  async getProductVariants(productId: number | string): Promise<ProductVariant[]> {
    try {
      const response = await apiClient.get<BackendVariantsResponse>(
        `/product/${productId}/variants`
      );
      const body = response.data;
      if (body?.success) {
        return (body.variants || body.data || []) as ProductVariant[];
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch product variants');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check product availability
   */
  async getProductAvailability(productId: number | string): Promise<{
    inStock: boolean;
    quantity: number;
    estimatedDelivery?: string;
  }> {
    try {
      const response = await apiClient.get<BackendAvailabilityResponse>(`/product/${productId}/avaialability`);
      const body = response.data;
      if (body?.success) {
        const isInStock = body.is_in_stock ?? body.data?.is_in_stock ?? false;
        return { inStock: !!isInStock, quantity: isInStock ? 1 : 0 };
      }

      throw new Error(body?.message || body?.error || 'Failed to check availability');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product price history
   */
  async getProductPriceHistory(productId: number | string): Promise<PriceHistory[]> {
    try {
      const response = await apiClient.get<BackendPriceHistoryResponse>(
        `/product/${productId}/price_history`
      );
      const body = response.data;
      if (body?.success) {
        const list = body.price_history || body.data || [];
        return list.map((h) => ({ date: h.date, price: h.price })) as PriceHistory[];
      }

      throw new Error(body?.message || body?.error || 'Failed to fetch price history');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product reviews (assuming this exists or will be added)
   */
  async getProductReviews(productId: number | string): Promise<ProductReview[]> {
    try {
      // This endpoint might not exist in current backend but is commonly needed
      const response = await apiClient.get<ApiResponse<ProductReview[]>>(
        `/product/${productId}/reviews`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return []; // Return empty array if no reviews endpoint
    } catch (error) {
      console.warn('Reviews endpoint not available:', handleApiError(error));
      return [];
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(productId: number | string, reviewId: number | string): Promise<void> {
    try {
      const response = await apiClient.post<BackendBaseResponse>(
        `/product/${productId}/review/${reviewId}/helpful`
      );
      const body = response.data;
      if (!body?.success) {
        throw new Error(body?.message || body?.error || 'Failed to mark review as helpful');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;