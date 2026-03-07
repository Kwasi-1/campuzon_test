import apiClient, { ApiResponse, PaginatedResponse } from './apiClient';

// Product Types
export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  stallId: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  images: string[];
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// Order Types
export interface StoreOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  deliveryAddress: string;
  deliveryMethod: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

// Transaction Types
export interface StoreTransaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  type: 'sale' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  category: string;
  description: string;
  reference?: string;
  fee?: number;
  netAmount?: number;
}

// Notification Types
export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// Dashboard Types
export interface StoreDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  pendingOrders: number;
  lowStockProducts: number;
  conversionRate: number;
  topSellingProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  recentOrders: StoreOrder[];
  revenueChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

// Filter Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  inStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface TransactionFilters {
  search?: string;
  status?: string;
  type?: string;
  paymentMethod?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationFilters {
  search?: string;
  type?: string;
  category?: string;
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Complete Store Service Class
 */
class StoreService {
  
  // ================================
  // DASHBOARD METHODS
  // ================================
  
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(period: string = '30d'): Promise<StoreDashboardStats> {
    try {
      // We first check session for stall info, otherwise require caller to pass stallId via params in future
      type StallStatus = { success: boolean; logged_in: boolean; stall_id?: string };
      const status = await apiClient.get<StallStatus>('/stall/auth/status');
      const stallId = status.data?.stall_id;

      if (!stallId) {
        throw new Error('Not authenticated as a stall owner');
      }

      type StallStatistics = {
        total_products?: number;
        total_orders?: number;
        total_revenue?: number;
        todays_revenue?: number;
        average_rating?: number;
        total_reviews?: number;
        view_count?: number;
        follower_count?: number;
        commission_rate?: number;
        last_updated?: string;
      };
      const statsResp = await apiClient.get<{ success: boolean; statistics: StallStatistics }>(
        `/stall/auth/stall/${encodeURIComponent(stallId)}/statistics`
      );

      if (statsResp.data.success && statsResp.data.statistics) {
        const s = statsResp.data.statistics;
        // Map backend fields to frontend StoreDashboardStats shape with sensible fallbacks
        const mapped: StoreDashboardStats = {
          totalProducts: s.total_products ?? 0,
          totalOrders: s.total_orders ?? 0,
          totalRevenue: s.total_revenue ?? 0,
          totalCustomers: 0,
          averageOrderValue: s.total_orders ? (s.total_revenue || 0) / s.total_orders : 0,
          pendingOrders: 0,
          lowStockProducts: 0,
          conversionRate: 0,
          topSellingProducts: [],
          recentOrders: [],
          revenueChart: s.todays_revenue !== undefined ? [{ date: new Date().toISOString().slice(0,10), revenue: s.todays_revenue || 0, orders: 0 }] : []
        };
        return mapped;
      }

      throw new Error('Failed to fetch dashboard stats');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // PRODUCT METHODS
  // ================================

  /**
   * Get products with pagination and filters
   */
  async getProducts(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<StoreProduct>> {
    try {
      // Use public stall products endpoint with authenticated stall_id
      type StallStatus = { success: boolean; logged_in: boolean; stall_id?: string };
      const status = await apiClient.get<StallStatus>('/stall/auth/status');
      const stallId = status.data?.stall_id;
      if (!stallId) {
        throw new Error('Not authenticated as a stall owner');
      }

      const params = new URLSearchParams({
        page: String(page),
        per_page: String(limit),
      });
      if (filters.search) params.set('search', String(filters.search));
      if (filters.category) params.set('category', String(filters.category));
      if (filters.inStock !== undefined) params.set('in_stock', String(!!filters.inStock));

      const resp = await apiClient.get<{
        success: boolean;
        stall: { stall_id: string };
        products: Array<{
          id: string;
          name: string;
          short_description?: string;
          price: number;
          stock_quantity?: number;
          average_rating?: number;
          is_in_stock?: boolean;
          is_featured?: boolean;
          primary_image?: string | null;
          category?: string;
          subcategory?: string;
          created_at?: string;
        }>;
        pagination: { page: number; per_page: number; total: number; total_pages: number };
      }>(`/stall/dashboard/${encodeURIComponent(stallId)}/products?${params}`);

      if (resp.data.success) {
        const mapped: StoreProduct[] = resp.data.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.short_description || '',
          price: p.price,
          category: p.category || '',
          subcategory: p.subcategory,
          images: p.primary_image ? [p.primary_image] : [],
          inStock: !!p.is_in_stock,
          stockQuantity: p.stock_quantity || 0,
          sku: undefined,
          isActive: true,
          isFeatured: !!p.is_featured,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.created_at || new Date().toISOString(),
          stallId: stallId,
        }));

        return {
          success: true,
          data: mapped,
          pagination: {
            page: resp.data.pagination.page,
            pages: resp.data.pagination.total_pages,
            total: resp.data.pagination.total,
            limit: resp.data.pagination.per_page,
          },
        };
      }

      throw new Error('Failed to fetch products');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<StoreProduct> {
    try {
      // Use public product details endpoint
      const response = await apiClient.get<{
        success: boolean;
        product: {
          id: string;
          name: string;
          description?: string;
          price: number;
          category?: string;
          subcategory?: string;
          images?: { url: string }[];
          stock_quantity?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          stall?: { stall_id: string };
        };
      }>(`/product/${encodeURIComponent(productId)}`);

      if (response.data.success && response.data.product) {
        const p = response.data.product;
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          category: p.category || '',
          subcategory: p.subcategory,
          images: p.images?.map((i) => i.url) || [],
          inStock: (p.stock_quantity || 0) > 0,
          stockQuantity: p.stock_quantity || 0,
          isActive: (p.status || 'active') === 'active',
          isFeatured: false,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || p.created_at || new Date().toISOString(),
          stallId: p.stall?.stall_id || '',
        };
      }

      throw new Error('Product not found');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData: CreateProductRequest): Promise<StoreProduct> {
    try {
      throw new Error('Product creation is not available yet. Please contact support.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update product
   */
  async updateProduct(productData: UpdateProductRequest): Promise<StoreProduct> {
    try {
      throw new Error('Product update is not available yet. Please contact support.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      throw new Error('Product deletion is not available yet. Please contact support.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(productId: string, isActive: boolean): Promise<StoreProduct> {
    try {
      throw new Error('Product status update is not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update product stock
   */
  async updateProductStock(productId: string, quantity: number): Promise<StoreProduct> {
    try {
      throw new Error('Product stock update is not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Upload product images
   */
  async uploadProductImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post<ApiResponse<{ urls: string[] }>>(
        '/stall/upload/product-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.urls;
      }

      throw new Error(response.data.message || 'Failed to upload images');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // ORDER METHODS
  // ================================

  /**
   * Get orders with pagination and filters
   */
  async getOrders(
    page: number = 1,
    limit: number = 20,
    filters: OrderFilters = {}
  ): Promise<PaginatedResponse<StoreOrder>> {
    try {
      // No dedicated stall orders endpoint; use recent_orders from stall details
      type StallStatus = { success: boolean; logged_in: boolean; stall_id?: string };
      const status = await apiClient.get<StallStatus>('/stall/auth/status');
      const stallId = status.data?.stall_id;
      if (!stallId) throw new Error('Not authenticated as a stall owner');

      const resp = await apiClient.get<{
        success: boolean;
        stall: {
          recent_orders: Array<{
            id: string;
            order_number: string;
            customer_name: string;
            total_amount: number;
            status: StoreOrder['status'];
            created_at: string;
          }>;
        };
      }>(`/stall/auth/stall/${encodeURIComponent(stallId)}`);

      if (resp.data.success) {
        const allOrders = resp.data.stall.recent_orders || [];
        // Basic client-side pagination on limited dataset
        const start = (page - 1) * limit;
        const pageItems = allOrders.slice(start, start + limit);
        const mapped: StoreOrder[] = pageItems.map((o) => ({
          id: o.id,
          customerId: '',
          customerName: o.customer_name,
          customerEmail: '',
          customerPhone: '',
          items: [],
          totalAmount: o.total_amount,
          status: o.status,
          paymentStatus: 'pending',
          paymentMethod: '',
          deliveryAddress: '',
          deliveryMethod: '',
          priority: 'low',
          createdAt: o.created_at,
          updatedAt: o.created_at,
          estimatedDelivery: undefined,
          notes: '',
        }));

        return {
          success: true,
          data: mapped,
          pagination: {
            page,
            pages: Math.max(1, Math.ceil(allOrders.length / limit)),
            total: allOrders.length,
            limit,
          },
        };
      }

      throw new Error('Failed to fetch orders');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<StoreOrder> {
    try {
      // Attempt to find in recent_orders
      type StallStatus = { success: boolean; logged_in: boolean; stall_id?: string };
      const status = await apiClient.get<StallStatus>('/stall/auth/status');
      const stallId = status.data?.stall_id;
      if (!stallId) throw new Error('Not authenticated as a stall owner');

      const resp = await apiClient.get<{
        success: boolean;
        stall: { recent_orders: Array<{ id: string; customer_name: string; total_amount: number; status: StoreOrder['status']; created_at: string }>; };
      }>(`/stall/auth/stall/${encodeURIComponent(stallId)}`);
      const found = resp.data.stall.recent_orders?.find((o) => o.id === orderId);
      if (resp.data.success && found) {
        return {
          id: found.id,
          customerId: '',
          customerName: found.customer_name,
          customerEmail: '',
          customerPhone: '',
          items: [],
          totalAmount: found.total_amount,
          status: found.status,
          paymentStatus: 'pending',
          paymentMethod: '',
          deliveryAddress: '',
          deliveryMethod: '',
          priority: 'low',
          createdAt: found.created_at,
          updatedAt: found.created_at,
        };
      }

      throw new Error('Order not found');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string, 
    status: StoreOrder['status'],
    notes?: string
  ): Promise<StoreOrder> {
    try {
      throw new Error('Order status update is not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // TRANSACTION METHODS
  // ================================

  /**
   * Get transactions with pagination and filters
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<StoreTransaction>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      throw new Error('Transactions endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<StoreTransaction> {
    try {
      throw new Error('Transactions endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get transaction summary/analytics
   */
  async getTransactionSummary(
    period: string = '7d',
    filters: Partial<TransactionFilters> = {}
  ): Promise<unknown> {
    try {
      throw new Error('Transaction summary not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // NOTIFICATION METHODS
  // ================================

  /**
   * Get notifications with pagination and filters
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    filters: NotificationFilters = {}
  ): Promise<PaginatedResponse<StoreNotification>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<unknown> {
    try {
      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: unknown): Promise<void> {
    try {
      throw new Error('Notifications endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // SETTINGS METHODS
  // ================================

  /**
   * Get store settings
   */
  async getStoreSettings(): Promise<unknown> {
    try {
      throw new Error('Store settings endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(settings: unknown): Promise<unknown> {
    try {
      throw new Error('Store settings endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // ANALYTICS METHODS
  // ================================

  /**
   * Get analytics data
   */
  async getAnalytics(period: string = '30d'): Promise<unknown> {
    try {
      throw new Error('Analytics endpoint not available yet.');
    } catch (error: unknown) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: unknown): string {
    const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
    if (err.response?.data?.error) {
      return err.response.data.error;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
    return 'An unexpected error occurred';
  }
}

const storeService = new StoreService();
export default storeService;