// ==================== ENUMS ====================

export type UserRole = 'student' | 'seller';

export type Category =
  | 'beauty'
  | 'electronics'
  | 'fashion'
  | 'clothing'
  | 'accessories'
  | 'furniture'
  | 'sports'
  | 'groceries'
  | 'books'
  | 'stationery'
  | 'services'
  | 'food'
  | 'other';

export type ProductCondition = 'new' | 'used_like_new' | 'used_good' | 'used_fair';

export type ProductStatus = 'draft' | 'active' | 'sold_out' | 'paused' | 'deleted';

export type StoreStatus = 'pending' | 'active' | 'suspended' | 'closed';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type DeliveryMethod = 'pickup' | 'delivery' | 'digital';

export type TransactionType = 'payment' | 'refund' | 'payout' | 'subscription' | 'fee';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';

export type EscrowStatus = 'holding' | 'released' | 'refunded' | 'disputed';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'
  | 'resolved_seller'
  | 'cancelled';

export type DisputeReason =
  | 'not_received'
  | 'not_as_described'
  | 'damaged'
  | 'wrong_item'
  | 'quality_issue'
  | 'other';

export type NotificationType = 'order' | 'chat' | 'payment' | 'dispute' | 'system' | 'promo';

export type AccountType = 'mobile_money' | 'bank';

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

// ==================== INTERFACES ====================

export interface Institution {
  id: string;
  name: string;
  shortName: string | null;
  region: string;
  city: string | null;
  isActive: boolean;
}

export interface Hall {
  id: string;
  name: string;
  institutionID: string;
  isActive: boolean;
}

export type TwoFactorMethod = 'none' | 'otp' | 'totp';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  isOwner: boolean;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  institutionID: string | null;
  hallID: string | null;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  dateCreated: string;
  institution?: Institution;
  hall?: Hall;
  store?: Store;
}

export interface Store {
  id: string;
  storeName: string;
  storeSlug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  email: string;
  phoneNumber: string;
  status: StoreStatus;
  isVerified: boolean;
  rating: number | null;
  totalSales?: number;
  totalOrders?: number;
  institutionID: string | null;
  autoResponderEnabled: boolean;
  autoResponderName: string | null;
  dateCreated: string;
}

export interface Product {
  id: string;
  storeID: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  quantity: number;
  minOrderQuantity: number;
  maxOrderQuantity: number | null;
  images: string[];
  thumbnail: string | null;
  category: Category;
  condition?: ProductCondition;
  tags: string[];
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  rating: number | null;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  dateCreated: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

export interface OrderItem {
  id: string;
  orderID?: string;
  productID: string | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal?: number;
  totalPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userID: string;
  storeID: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  buyerNote: string | null;
  sellerNote: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  dateCreated: string;
  items?: OrderItem[];
  store?: Store;
  escrow?: Escrow;
  dispute?: Dispute;
  conversationID?: string;
}

export interface Escrow {
  id: string;
  orderID: string;
  amount: number;
  buyerFee: number;
  sellerCommission: number;
  platformFee: number;
  sellerAmount: number;
  status: EscrowStatus;
  holdUntil: string;
  releasedAt: string | null;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  provider: string | null;
  dateCreated: string;
}

export interface Dispute {
  id: string;
  orderID: string;
  reason: DisputeReason;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  resolution: string | null;
  resolvedAt: string | null;
  dateCreated: string;
}

export interface Review {
  id: string;
  userID: string;
  productID: string | null;
  storeID: string | null;
  orderID: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  isVerifiedPurchase: boolean;
  sellerResponse: string | null;
  sellerResponseDate: string | null;
  dateCreated: string;
  user?: {
    displayName: string;
    profileImage: string | null;
  };
  product?: {
    id: string;
    name: string;
    thumbnail: string | null;
  };
}

export interface Conversation {
  id: string;
  buyerID: string;
  storeID: string;
  productID: string | null;
  orderID: string | null;
  type: 'inquiry' | 'order' | 'support';
  subject: string | null;
  isActive: boolean;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  lastMessageAt: string;
  dateCreated: string;
  product?: {
    id: string;
    name: string;
    price: number;
    thumbnail: string | null;
  };
  store?: {
    id: string;
    name: string;
    logo: string | null;
  };
  participant?: {
    type: 'user' | 'store';
    id: string;
    name: string | null;
    image: string | null;
  };
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  conversationID: string;
  senderID: string | null;
  content: string;
  messageType: 'text' | 'image' | 'system';
  attachments: string | null;
  isRead: boolean;
  isSystemMessage: boolean;
  isDeleted: boolean;
  dateCreated: string;
  sender?: {
    id: string;
    displayName: string;
    profileImage: string | null;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceType: string | null;
  referenceID: string | null;
  isRead: boolean;
  dateCreated: string;
}

export interface WishlistItem extends Product {
  wishlistItemID: string;
  addedAt: string;
}

export interface Account {
  id: string;
  name: string;
  number: string;
  provider: string;
  type: AccountType;
  isDefault: boolean;
  isVerified: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: {
    status: string;
    message?: string;
    code: number;
    data: T;
  };
}

export interface ApiError {
  error: {
    status: string;
    message: string;
    code: number;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ==================== REQUEST TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  institutionID: string;
  hallID?: string;
  displayName?: string;
}

export interface CreateOrderRequest {
  storeID: string;
  items: Array<{
    productID: string;
    quantity: number;
  }>;
  deliveryMethod: DeliveryMethod;
  deliveryFee?: number;
  deliveryAddress?: string;
  deliveryNotes?: string;
  buyerNote?: string;
  institutionID?: string;
  hallID?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  quantity: number;
  category: Category;
  description?: string;
  discountPrice?: number;
  tags?: string[];
  images?: string[];
}

export interface CreateReviewRequest {
  orderID: string;
  productID?: string;
  storeID?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface CreateDisputeRequest {
  reason: DisputeReason;
  description: string;
  evidence?: string[];
}

// ==================== CART TYPES ====================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  storeID: string;
  storeName: string;
  storeSlug: string;
  items: CartItem[];
}

// ==================== PAGINATION / FILTER TYPES ====================

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
  // Convenient accessors for common pagination properties
  total: number;
  pages: number;
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductFilters {
  page?: number;
  perPage?: number;
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'date_created' | 'rating' | 'sold_count';
  sortOrder?: 'asc' | 'desc';
  storeId?: string;
}

// Alias for ChatMessage for backwards compatibility
export type Message = ChatMessage;
