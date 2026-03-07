/**
 * Order Service
 * 
 * Handles all order-related API calls including checkout, order management,
 * and Paystack payment integration.
 */

import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from './apiClient';
import { Order, CartItem } from '@/types';

// Order service types
export interface CheckoutRequest {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'paystack' | 'card' | 'bank_transfer';
  deliveryMethod: 'standard' | 'express' | 'pickup';
  notes?: string;
}

export interface CheckoutResponse {
  orderId: string;
  paymentReference: string;
  paymentUrl?: string;
  total: number;
  status: string;
}

export interface PaystackPaymentData {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  success: boolean;
  paymentStatus: string;
  orderId: string;
  reference: string;
  amount: number;
  paidAt?: string;
}

export interface OrderTrackingUpdate {
  status: string;
  timestamp: string;
  description: string;
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number; // kept for compatibility, mapped to per_page for backend
}

/**
 * Order Service Class
 */
class OrderService {
  private readonly PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  /**
   * Initialize checkout process
   */
  async checkout(checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post<ApiResponse<CheckoutResponse>>('/payment/checkout', {
        delivery_address: checkoutData.deliveryAddress,
        payment_method: checkoutData.paymentMethod,
        delivery_method: checkoutData.deliveryMethod,
        notes: checkoutData.notes,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Checkout failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Initialize Paystack payment
   */
  async initializePayment(orderData: {
    email: string;
    amount: number;
    orderId: string;
    metadata?: Record<string, unknown>;
  }): Promise<{
    reference: string;
    authorization_url?: string;
    access_code?: string;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        reference: string;
        authorization_url?: string;
        access_code?: string;
      }>>('/payment/initialize', {
        email: orderData.email,
        amount: Math.round(orderData.amount * 100), // Convert to kobo for Paystack
        order_id: orderData.orderId,
        callback_url: `${window.location.origin}/order/callback`,
        metadata: {
          order_id: orderData.orderId,
          ...orderData.metadata,
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Payment initialization failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify payment with backend
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await apiClient.get<ApiResponse<{
        success: boolean;
        payment_status: string;
        order_id: string;
        reference: string;
        amount: number;
        paid_at?: string;
      }>>(`/payment/verify/${reference}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        return {
          success: data.success,
          paymentStatus: data.payment_status,
          orderId: data.order_id,
          reference: data.reference,
          amount: data.amount / 100, // Convert back from kobo
          paidAt: data.paid_at,
        };
      }

      throw new Error(response.data.message || 'Payment verification failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user orders with pagination
   */
  async getOrders(filters: OrderFilters = {}): Promise<{
    orders: Order[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Backend returns data: { orders: [...], pagination: { page, per_page, total, total_pages } }
      type BackendOrder = {
        id: string;
        order_number?: string;
        stall?: { id: string; name: string; stall_id?: string };
        items: Array<{ id?: string | number; quantity?: number; price?: number; name?: string }>;
        total_amount: number;
        status: string;
        payment_status?: string;
        payment_method?: string;
        delivery_method?: string;
        estimated_delivery?: string;
        created_at: string;
      };
      type BackendPagination = {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.page) params.append('page', String(filters.page));
      // Map limit -> per_page for backend
      if (filters.limit) params.append('per_page', String(filters.limit));

      const response = await apiClient.get<ApiResponse<{ orders: BackendOrder[]; pagination: BackendPagination }>>(
        `/user/account/orders?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        const backendOrders = response.data.data.orders || [];
        const mapped: Order[] = backendOrders.map((o) => {
          const itemCount = Array.isArray(o.items)
            ? o.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
            : 0;
          return {
            id: o.id,
            items: (o.items as unknown as CartItem[]) || [],
            total: o.total_amount,
            status: o.status,
            createdAt: o.created_at,
            date: o.created_at,
            itemCount,
            deliveryMethod: o.delivery_method || '',
            paymentMethod: o.payment_method || '',
            estimatedDelivery: o.estimated_delivery,
            deliveryAddress: '',
          };
        });

        const p = response.data.data.pagination;
        const pagination = p
          ? { page: p.page, limit: p.per_page, total: p.total, totalPages: p.total_pages }
          : undefined;

        return { orders: mapped, pagination };
      }

      return { orders: [] };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get specific order details
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      // Backend returns data: { order: { ... } }
      type BackendOrderItem = { id?: string | number; quantity?: number; price?: number; name?: string };
      type BackendOrderDetails = {
        id?: string;
        order_id?: string;
        items: BackendOrderItem[];
        pricing?: { total_amount?: number };
        total_amount?: number;
        status: string;
        timestamps?: { created_at?: string };
        created_at?: string;
        delivery?: {
          method?: string;
          address?: { street?: string; city?: string; state?: string } | null;
          estimated_delivery?: string;
        };
        delivery_method?: string;
        estimated_delivery?: string;
        payment?: { method?: string; reference?: string; status?: string };
        payment_method?: string;
        payment_reference?: string;
        payment_status?: string;
      };

      const response = await apiClient.get<ApiResponse<{ order: BackendOrderDetails }>>(`/user/account/orders/${orderId}`);

      if (response.data.success && response.data.data && response.data.data.order) {
        const o = response.data.data.order;
        const items = (o.items as unknown as CartItem[]) || [];
        const itemCount = Array.isArray(items)
          ? items.reduce((sum, it) => sum + (Number((it as unknown as { quantity?: number }).quantity) || 0), 0)
          : 0;
        const deliveryAddress = o.delivery?.address
          ? [o.delivery.address.street, o.delivery.address.city, o.delivery.address.state]
              .filter(Boolean)
              .join(', ')
          : '';

        const mapped: Order = {
          id: String(o.id || o.order_id || orderId),
          items,
          total: o.pricing?.total_amount ?? o.total_amount ?? 0,
          status: o.status,
          createdAt: o.timestamps?.created_at ?? o.created_at,
          date: o.timestamps?.created_at ?? o.created_at,
          itemCount,
          deliveryMethod: o.delivery?.method || o.delivery_method || '',
          paymentMethod: o.payment?.method || o.payment_method || '',
          estimatedDelivery: o.delivery?.estimated_delivery || o.estimated_delivery,
          paymentReference: o.payment?.reference || o.payment_reference,
          paymentStatus: o.payment?.status || o.payment_status,
          deliveryAddress,
        };

        return mapped;
      }

      throw new Error(response.data.message || 'Order not found');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>(`/user/account/orders/${orderId}/cancel`, {
        reason,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Track order status
   */
  async trackOrder(orderId: string): Promise<{
    status: string;
    history: Array<OrderTrackingUpdate>;
    estimatedDelivery?: string;
    trackingNumber?: string;
  }> {
    try {
      // Using tracking endpoint from ROUTES.md
      const response = await apiClient.get<ApiResponse<{
        status: string;
        history: Array<{
          status: string;
          timestamp: string;
          description: string;
        }>;
        estimated_delivery?: string;
        tracking_number?: string;
      }>>(`/rtt/myorders/${orderId}/tracking`);

      if (response.data.success && response.data.data) {
        return {
          status: response.data.data.status,
          history: response.data.data.history,
          estimatedDelivery: response.data.data.estimated_delivery,
          trackingNumber: response.data.data.tracking_number,
        };
      }

      throw new Error(response.data.message || 'Failed to track order');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request refund
   */
  async requestRefund(orderId: string, reason: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/payment/refund', {
        order_id: orderId,
        reason,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to request refund');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(filters: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    payments: Array<{
      id: string;
      orderId: string;
      amount: number;
      status: string;
      method: string;
      reference: string;
      date: string;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.page) searchParams.append('page', filters.page.toString());
      if (filters.limit) searchParams.append('limit', filters.limit.toString());
      if (filters.startDate) searchParams.append('start_date', filters.startDate);
      if (filters.endDate) searchParams.append('end_date', filters.endDate);

      const response = await apiClient.get<PaginatedResponse<{
        id: string;
        order_id: string;
        amount: number;
        status: string;
        method: string;
        reference: string;
        date: string;
      }>>(`/payment/history?${searchParams.toString()}`);

      if (response.data.success && response.data.data) {
        return {
          payments: response.data.data.map(payment => ({
            id: payment.id,
            orderId: payment.order_id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            reference: payment.reference,
            date: payment.date,
          })),
          pagination: response.data.pagination
            ? ((p => ({
                page: p.page,
                limit: p.limit,
                total: p.total,
                totalPages: (p as unknown as { totalPages?: number }).totalPages ?? (p as unknown as { pages?: number }).pages ?? 0,
              }))(response.data.pagination))
            : undefined,
        };
      }

      return { payments: [] };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    description?: string;
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<Array<{
        id: string;
        name: string;
        type: string;
        enabled: boolean;
        description?: string;
      }>>>('/payment/methods');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      // Return default payment methods if endpoint fails
      return [
        { id: 'paystack', name: 'Paystack', type: 'card', enabled: true, description: 'Pay with card via Paystack' },
        { id: 'bank_transfer', name: 'Bank Transfer', type: 'bank', enabled: true, description: 'Direct bank transfer' },
      ];
    } catch (error) {
      console.warn('Payment methods endpoint not available:', handleApiError(error));
      return [
        { id: 'paystack', name: 'Paystack', type: 'card', enabled: true, description: 'Pay with card via Paystack' },
      ];
    }
  }

  /**
   * Handle Paystack popup payment
   */
  async handlePaystackPayment(paymentData: PaystackPaymentData): Promise<PaymentVerificationResult> {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        reject(new Error('Paystack library not loaded'));
        return;
      }

      const handler = window.PaystackPop.setup({
        key: this.PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: Math.round(paymentData.amount * 100), // Convert to kobo
        currency: paymentData.currency || 'GHS',
        ref: paymentData.reference,
        metadata: paymentData.metadata,
        callback: async (response: { reference: string }) => {
          try {
            const verificationResult = await this.verifyPayment(response.reference);
            resolve(verificationResult);
          } catch (error) {
            reject(error);
          }
        },
        onClose: () => {
          reject(new Error('Payment was cancelled'));
        },
      });

      handler.openIframe();
    });
  }

  /**
   * Get order summary for checkout
   */
  async getCheckoutSummary(): Promise<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    estimatedDelivery?: string;
  }> {
    try {
      // This would typically get cart data and calculate totals
      const response = await apiClient.get<ApiResponse<{
        items: CartItem[];
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        estimated_delivery?: string;
      }>>('/user/account/cart');

      if (response.data.success && response.data.data) {
        return {
          items: response.data.data.items,
          subtotal: response.data.data.subtotal,
          tax: response.data.data.tax || 0,
          shipping: response.data.data.shipping || 0,
          total: response.data.data.total,
          estimatedDelivery: response.data.data.estimated_delivery,
        };
      }

      throw new Error('Failed to get checkout summary');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService;