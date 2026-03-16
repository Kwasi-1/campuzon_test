/**
 * Services Index
 * 
 * Centralized exports for all API services
 */

// Export API client
export { default as apiClient, handleApiError } from './apiClient';
export type { ApiResponse, PaginatedResponse } from './apiClient';

// Export authentication service
export { default as authService } from './authService';
export type { 
  LoginResult,
  LoginResponse, 
  SignupResponse, 
  ProfileResponse 
} from './authService';

// Export store authentication service
export { default as storeAuthService } from './storeAuthService';

// Export product service
export { default as productService } from './productService';
export type { 
  ProductFilters, 
  ProductSearchParams, 
  ProductVariant, 
  ProductReview, 
  PriceHistory 
} from './productService';

// Export cart service
export { default as cartService } from './cartService';
export type { 
  AddToCartRequest, 
  RemoveFromCartRequest, 
  UpdateCartItemRequest, 
  CartSummary 
} from './cartService';

// Export order service
export { default as orderService } from './orderService';
export type { 
  CheckoutRequest, 
  CheckoutResponse, 
  PaystackPaymentData,
  PaymentVerificationResult, 
  OrderFilters, 
  OrderTrackingUpdate 
} from './orderService';

// Export saved items (wishlist/shopping list) service
export { default as savedItemsService } from './savedItemsService';

// Export profile addresses service
export { default as profileAddressesService } from './profileAddressesService';
export type { ProfileAddress, AddressType } from './profileAddressesService';