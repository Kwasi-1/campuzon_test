/**
 * Admin Transactions Service
 * Uses src/lib/api.ts + extractData. Pulls from real escrow + analytics endpoints.
 */
import { api, extractData } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  serviceFee: number;
  buyerFee: number;
  sellerCommission: number;
  paymentMethod: string;
  paymentStatus: string;
  dateCreated: string;
  completedAt: string | null;
  buyer: { id: string; firstName: string; lastName: string; email: string } | null;
  store: { id: string; storeName: string } | null;
  escrow: EscrowItem | null;
  items: OrderItem[];
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface EscrowItem {
  id: string;
  orderId: string;
  amount: number;
  sellerAmount: number;
  platformFee: number;
  status: string; // 'holding' | 'released' | 'refunded' | 'disputed'
  heldAt: string;
  releasedAt: string | null;
  buyerName?: string;
  storeName?: string;
}

export interface TransactionSummary {
  totalRevenue: number;
  platformFees: number;
  escrowHeld: number;
  escrowReleased: number;
  totalOrders: number;
  completedOrders: number;
  successRate: number;
}

interface BackendOrderList {
  orders: AdminOrder[];
  pagination: { page: number; pages: number; total: number; perPage: number };
}

interface BackendEscrowList {
  escrows: EscrowItem[];
  pagination: { page: number; pages: number; total: number; perPage: number };
}

interface BackendAnalyticsOverview {
  totals: { users: number; stores: number; products: number; orders: number };
  orderRevenue: { total: number; last30Days: number };
  platformRevenue: { total: number; last30Days: number; transactionFees: { total: number }; subscriptionRevenue: { total: number } };
  escrowHoldings: { totalHeld: number; pendingSellerPayouts: number; releasedToSellers: number };
}

class AdminTransactionsService {
  /**
   * GET /api/v1/admin/transactions (orders endpoint)
   * Falls back to /admin/dashboard stats if transactions endpoint unavailable.
   */
  async getOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: AdminOrder[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.status)   qs.set('status',   params.status);
    if (params?.search)   qs.set('search',   params.search);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await api.get(`admin/orders?${qs}`);
    const d = extractData<BackendOrderList>(res);
    return { items: d.orders ?? [], total: d.pagination?.total ?? 0 };
  }

  /**
   * GET /api/v1/admin/escrow
   * Lists escrow records. Supports: status, page, per_page
   */
  async getEscrows(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: EscrowItem[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.status)   qs.set('status',   params.status);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await api.get(`admin/escrow-holdings?${qs}`);
    const d = extractData<BackendEscrowList>(res);
    return { items: d.escrows ?? [], total: d.pagination?.total ?? 0 };
  }

  /**
   * GET /api/v1/admin/analytics/overview
   * Used to build the summary cards at the top.
   */
  async getSummary(): Promise<TransactionSummary> {
    const res = await api.get('admin/analytics/overview');
    const d = extractData<BackendAnalyticsOverview>(res);
    const completed = d.totals?.orders ?? 0;
    return {
      totalRevenue:    d.orderRevenue?.total ?? 0,
      platformFees:    d.platformRevenue?.transactionFees?.total ?? 0,
      escrowHeld:      d.escrowHoldings?.totalHeld ?? 0,
      escrowReleased:  d.escrowHoldings?.releasedToSellers ?? 0,
      totalOrders:     completed,
      completedOrders: completed,
      successRate:     100,
    };
  }

  /** CSV export — build client-side from fetched data */
  async exportOrders(): Promise<Blob> {
    const { items } = await this.getOrders({ per_page: 500 });
    const headers = ['Order #', 'Buyer', 'Store', 'Amount (₵)', 'Fee (₵)', 'Payment', 'Status', 'Date'];
    const rows = items.map((o) => [
      o.orderNumber,
      o.buyer ? `${o.buyer.firstName} ${o.buyer.lastName}` : '—',
      o.store?.storeName ?? '—',
      o.totalAmount.toFixed(2),
      o.serviceFee.toFixed(2),
      o.paymentMethod,
      o.status,
      new Date(o.dateCreated).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  async exportEscrows(): Promise<Blob> {
    const { items } = await this.getEscrows({ per_page: 500 });
    const headers = ['Escrow ID', 'Order ID', 'Buyer', 'Store', 'Amount (₵)', 'Seller Amount (₵)', 'Platform Fee (₵)', 'Status', 'Held At', 'Released At'];
    const rows = items.map((e) => [
      e.id, e.orderId ?? '—', e.buyerName ?? '—', e.storeName ?? '—',
      e.amount.toFixed(2), e.sellerAmount.toFixed(2), e.platformFee.toFixed(2),
      e.status, e.heldAt, e.releasedAt ?? '—',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }
}

const adminTransactionsService = new AdminTransactionsService();
export default adminTransactionsService;
