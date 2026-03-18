import type { Order, OrderItem, OrderStatus, ShippingAddress } from './index';

export interface SellerDashboardMetrics {
  availableBalance: number;
  pendingBalance: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  salesChangePct: number;
  ordersChangePct: number;
  productsChangePct: number;
  customersChangePct: number;
}

export interface SellerTopProduct {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  stock: number;
}

export interface SellerRecentMessage {
  conversationId: string;
  customerName: string;
  snippet: string;
  timestamp: string;
  unread: boolean;
}

export interface SellerWallet {
  id: string;
  storeID: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  lastWithdrawalAt: string | null;
}

export interface SellerWalletTransaction {
  id: string;
  walletID: string;
  amount: number;
  type: 'credit' | 'debit';
  subType: 'escrow_release' | 'withdrawal' | 'refund' | 'commission' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description: string;
  dateCreated: string;
}

export interface SellerAutoResponderConfig {
  enabled: boolean;
  botName: string;
  message: string;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function toString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = toString(value, '');
  return normalized === '' ? null : normalized;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

function normalizeShippingAddress(rawValue: unknown): ShippingAddress | undefined {
  const raw = toRecord(rawValue);
  const fullName = toString(raw.fullName ?? raw.full_name);
  const phone = toString(raw.phone ?? raw.phoneNumber ?? raw.phone_number);
  const addressLine1 = toString(raw.addressLine1 ?? raw.address_line_1 ?? raw.address ?? raw.location);
  const addressLine2 = toString(raw.addressLine2 ?? raw.address_line_2);
  const city = toString(raw.city ?? raw.town);
  const region = toString(raw.region ?? raw.state);

  if (!fullName && !phone && !addressLine1 && !city) return undefined;

  return {
    fullName,
    phone,
    addressLine1,
    ...(addressLine2 ? { addressLine2 } : {}),
    city,
    ...(region ? { region } : {}),
  };
}

function normalizeOrderItem(rawValue: unknown): OrderItem {
  const raw = toRecord(rawValue);
  const quantity = toNumber(raw.quantity, 0);
  const unitPrice = toNumber(raw.unitPrice ?? raw.unit_price ?? raw.price, 0);
  const subtotal = toNumber(raw.subtotal ?? raw.line_total ?? quantity * unitPrice, 0);

  return {
    id: toString(raw.id),
    orderID: toNullableString(raw.orderID ?? raw.order_id) ?? undefined,
    productID: toString(raw.productID ?? raw.product_id),
    productName: toString(raw.productName ?? raw.product_name ?? raw.name),
    productImage: toNullableString(raw.productImage ?? raw.product_image ?? raw.thumbnail),
    unitPrice,
    quantity,
    subtotal,
    totalPrice: toNumber(raw.totalPrice ?? raw.total_price ?? subtotal, subtotal),
  };
}

function normalizeOrderStore(rawValue: unknown): Order['store'] {
  const raw = toRecord(rawValue);
  const id = toString(raw.id);
  if (!id) return undefined;

  return {
    id,
    storeName: toString(raw.storeName ?? raw.store_name ?? raw.name),
    storeSlug: toString(raw.storeSlug ?? raw.store_slug ?? raw.slug),
    description: toNullableString(raw.description),
    logo: toNullableString(raw.logo),
    banner: toNullableString(raw.banner),
    email: toString(raw.email),
    phoneNumber: toString(raw.phoneNumber ?? raw.phone_number),
    status: toString(raw.status, 'active') as Order['store']['status'],
    isVerified: toBoolean(raw.isVerified ?? raw.is_verified, false),
    rating: raw.rating === null ? null : toNumber(raw.rating, 0),
    totalSales: toNumber(raw.totalSales ?? raw.total_sales, 0),
    totalOrders: toNumber(raw.totalOrders ?? raw.total_orders, 0),
    institutionID: toNullableString(raw.institutionID ?? raw.institution_id),
    autoResponderEnabled: toBoolean(
      raw.autoResponderEnabled ?? raw.auto_responder_enabled,
      false,
    ),
    autoResponderName: toNullableString(
      raw.autoResponderName ?? raw.auto_responder_name,
    ),
    dateCreated: toString(raw.dateCreated ?? raw.date_created),
  };
}

export function normalizeSellerOrder(rawValue: unknown): Order {
  const raw = toRecord(rawValue);
  const itemsSource = raw.items ?? raw.order_items;
  const items = Array.isArray(itemsSource) ? itemsSource.map(normalizeOrderItem) : [];

  const shippingAddress =
    normalizeShippingAddress(raw.shippingAddress ?? raw.shipping_address) ??
    normalizeShippingAddress(raw.deliveryAddressObject ?? raw.delivery_address_object);

  return {
    id: toString(raw.id),
    orderNumber: toString(raw.orderNumber ?? raw.order_number),
    userID: toString(raw.userID ?? raw.user_id ?? raw.buyer_id),
    storeID: toString(raw.storeID ?? raw.store_id),
    status: toString(raw.status, 'pending') as OrderStatus,
    deliveryMethod: (toString(raw.deliveryMethod ?? raw.delivery_method, 'delivery') as Order['deliveryMethod']),
    subtotal: toNumber(raw.subtotal, 0),
    deliveryFee: toNumber(raw.deliveryFee ?? raw.delivery_fee, 0),
    serviceFee: toNumber(raw.serviceFee ?? raw.service_fee, 0),
    discount: toNumber(raw.discount, 0),
    totalAmount: toNumber(raw.totalAmount ?? raw.total_amount, 0),
    deliveryAddress: toNullableString(raw.deliveryAddress ?? raw.delivery_address),
    deliveryNotes: toNullableString(raw.deliveryNotes ?? raw.delivery_notes),
    buyerNote: toNullableString(raw.buyerNote ?? raw.buyer_note),
    sellerNote: toNullableString(raw.sellerNote ?? raw.seller_note),
    shippingAddress,
    paidAt: toNullableString(raw.paidAt ?? raw.paid_at),
    shippedAt: toNullableString(raw.shippedAt ?? raw.shipped_at),
    deliveredAt: toNullableString(raw.deliveredAt ?? raw.delivered_at),
    completedAt: toNullableString(raw.completedAt ?? raw.completed_at),
    dateCreated: toString(raw.dateCreated ?? raw.date_created),
    items,
    store: normalizeOrderStore(raw.store),
    conversationID: toNullableString(raw.conversationID ?? raw.conversation_id) ?? undefined,
  };
}

export function normalizeSellerOrderArray(rawValue: unknown): Order[] {
  if (!Array.isArray(rawValue)) return [];
  return rawValue.map(normalizeSellerOrder);
}

export function normalizeSellerWallet(rawValue: unknown): SellerWallet {
  const raw = toRecord(rawValue);
  return {
    id: toString(raw.id),
    storeID: toString(raw.storeID ?? raw.store_id),
    balance: toNumber(raw.balance, 0),
    pendingBalance: toNumber(raw.pendingBalance ?? raw.pending_balance, 0),
    currency: toString(raw.currency, 'GHS'),
    lastWithdrawalAt: toNullableString(raw.lastWithdrawalAt ?? raw.last_withdrawal_at),
  };
}

export function normalizeSellerWalletTransaction(rawValue: unknown): SellerWalletTransaction {
  const raw = toRecord(rawValue);
  return {
    id: toString(raw.id),
    walletID: toString(raw.walletID ?? raw.wallet_id),
    amount: toNumber(raw.amount, 0),
    type: (toString(raw.type, 'credit') as SellerWalletTransaction['type']),
    subType: (toString(raw.subType ?? raw.sub_type, 'adjustment') as SellerWalletTransaction['subType']),
    status: (toString(raw.status, 'pending') as SellerWalletTransaction['status']),
    reference: toString(raw.reference),
    description: toString(raw.description),
    dateCreated: toString(raw.dateCreated ?? raw.date_created),
  };
}

export function normalizeSellerWalletTransactionArray(rawValue: unknown): SellerWalletTransaction[] {
  if (!Array.isArray(rawValue)) return [];
  return rawValue.map(normalizeSellerWalletTransaction);
}

export function normalizeSellerAutoResponderConfig(rawValue: unknown): SellerAutoResponderConfig {
  const raw = toRecord(rawValue);
  return {
    enabled: toBoolean(raw.enabled, false),
    botName: toString(raw.botName ?? raw.bot_name, ''),
    message: toString(raw.message, ''),
  };
}
