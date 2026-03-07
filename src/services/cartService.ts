/**
 * Cart Service
 * 
 * Handles all cart-related API calls including adding items to cart,
 * viewing cart, removing items, and managing cart state.
 */

import apiClient, { ApiResponse, handleApiError } from './apiClient';
import { CartItem, Product } from '@/types';

// Cart service types
export interface AddToCartRequest {
  productId: number | string;
  quantity: number;
  variant?: Record<string, string>; // For product variants like size, color
  variantId?: string | number; // Explicit variant ID when applicable
}

export interface RemoveFromCartRequest {
  itemId: number | string;
}

export interface UpdateCartItemRequest {
  itemId: number | string;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  estimatedDelivery?: string;
}

/**
 * Cart Service Class
 */
class CartService {
  /**
   * Get cart items for current user
   */
  async getCart(): Promise<CartSummary> {
    try {
      const response = await apiClient.get<ApiResponse<{ cart: {
        items?: CartItem[];
        subtotal?: number;
        tax?: number;
        shipping?: number;
        total?: number;
        item_count?: number;
        estimated_delivery?: string;
      } | undefined }>>('/user/account/cart');

      if (response.data.success && response.data.data) {
        const cartData = response.data.data.cart;
        if (!cartData) {
          return {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            itemCount: 0,
          };
        }
        return {
          items: cartData.items || [],
          subtotal: cartData.subtotal || 0,
          tax: cartData.tax || 0,
          shipping: cartData.shipping || 0,
          total: cartData.total || 0,
          itemCount: cartData.item_count || cartData.items?.length || 0,
          estimatedDelivery: cartData.estimated_delivery,
        };
      }

      // Return empty cart if no data
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<CartSummary> {
    try {
      await apiClient.post<ApiResponse>('/user/account/cart/add', {
        product_id: request.productId,
        quantity: request.quantity,
        // Backend accepts variant_id or variant; pass through if provided
        variant_id: request.variantId,
        variant: request.variant,
      });
      // After add, fetch full cart details
      return await this.getCart();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(request: RemoveFromCartRequest): Promise<CartSummary> {
    try {
      await apiClient.post<ApiResponse>('/user/account/cart/remove', {
        // Backend accepts product_id or item_id
        product_id: request.itemId,
        item_id: request.itemId,
      });
      // After remove, fetch updated cart
      return await this.getCart();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartSummary> {
    try {
      // Backend does not expose update endpoint; emulate by removing then adding with new quantity
      await this.removeFromCart({ itemId: request.itemId });
      return await this.addToCart({ productId: request.itemId, quantity: request.quantity });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      // No clear endpoint; remove all items one by one
      const cart = await this.getCart();
      for (const item of cart.items) {
        try {
          await this.removeFromCart({ itemId: item.id });
        } catch (e) {
          // continue removing others
        }
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get cart item count (lightweight call)
   */
  async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.itemCount;
    } catch (error) {
      console.warn('Failed to get cart count:', handleApiError(error));
      return 0;
    }
  }

  /**
   * Check if product is in cart
   */
  async isInCart(productId: number | string): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.some(item => item.id.toString() === productId.toString());
    } catch (error) {
      console.warn('Failed to check if item is in cart:', handleApiError(error));
      return false;
    }
  }

  /**
   * Get estimated delivery time for cart
   */
  async getEstimatedDelivery(): Promise<string | null> {
    try {
      const cart = await this.getCart();
      return cart.estimatedDelivery || null;
    } catch (error) {
      console.warn('Failed to get estimated delivery:', handleApiError(error));
      return null;
    }
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<{
    isValid: boolean;
    errors: string[];
    unavailableItems: string[];
  }> {
    try {
      const cart = await this.getCart();
      const errors: string[] = [];
      const unavailableItems: string[] = [];

      if (cart.items.length === 0) {
        errors.push('Cart is empty');
        return { isValid: false, errors, unavailableItems };
      }

      // Check each item availability (this would need a batch availability check endpoint)
      for (const item of cart.items) {
        if (!item.inStock) {
          unavailableItems.push(item.name);
        }
      }

      if (unavailableItems.length > 0) {
        errors.push(`Some items are out of stock: ${unavailableItems.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        unavailableItems,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [handleApiError(error)],
        unavailableItems: [],
      };
    }
  }

  /**
   * Apply coupon/discount code
   */
  async applyCoupon(couponCode: string): Promise<CartSummary> {
    try {
      // This endpoint might not exist in current backend
      const response = await apiClient.post<ApiResponse<CartSummary>>('/user/account/cart/coupon', {
        coupon_code: couponCode,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Invalid coupon code');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove coupon/discount code
   */
  async removeCoupon(): Promise<CartSummary> {
    try {
      const response = await apiClient.delete<ApiResponse<CartSummary>>('/user/account/cart/coupon');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to remove coupon');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  }): Promise<number> {
    try {
      const response = await apiClient.post<ApiResponse<{ shipping_cost: number }>>(
        '/user/account/cart/shipping',
        address
      );

      if (response.data.success && response.data.data) {
        return response.data.data.shipping_cost;
      }

      throw new Error(response.data.message || 'Failed to calculate shipping');
    } catch (error) {
      console.warn('Shipping calculation not available:', handleApiError(error));
      return 0; // Default to free shipping if calculation fails
    }
  }
}

// Export singleton instance
export const cartService = new CartService();
export default cartService;