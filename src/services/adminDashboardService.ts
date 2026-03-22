/**
 * Admin Dashboard Service
 * Uses the shared api client (src/lib/api.ts) with extractData helper.
 * The admin JWT is automatically attached by the interceptor in adminService.ts.
 */
import { api, extractData } from '@/lib/api';

// ──────────────────────────────────────────────
// Public types (used by the dashboard component)
// ──────────────────────────────────────────────
export interface DashboardOverview {
  totalUsers: number;
  newUsersMonth: number;
  newUsersWeek: number;
  activeUsers: number;
  totalStores: number;
  newStoresMonth: number;
  activeStores: number;
  pendingStores: number;
  totalOrders: number;
  ordersMonth: number;
  ordersWeek: number;
  ordersToday: number;
  totalRevenue: number;
  monthRevenue: number;
  weeklyRevenue: number;
  totalFees: number;
  openDisputes: number;
  pendingEscrow: number;
  totalProducts: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
  fees: number;
}

export interface EscrowSummary {
  totalHeld: number;
  pendingSellerPayouts: number;
  releasedToSellers: number;
}

export interface PlatformRevenueSummary {
  total: number;
  last30Days: number;
  transactionFees: number;
  subscriptionRevenue: number;
}

export interface TopStore {
  id: string;
  name: string;
  revenue: string;
  orders: number;
  institution?: string;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

// ──────────────────────────────────────────────
// Backend data shapes (server JSON)
// ──────────────────────────────────────────────
interface BackendDashboardStats {
  users:    { total: number; newThisMonth: number; newThisWeek: number; activeThisWeek: number };
  stores:   { total: number; active: number; pending: number; newThisMonth: number; newThisWeek: number };
  orders:   { total: number; thisMonth: number; thisWeek: number; today: number };
  revenue:  { total: number; thisMonth: number; thisWeek: number; totalFees: number };
  disputes: { open: number };
  escrow:   { pending: number };
  products: { total: number };
}

interface BackendAnalyticsOverview {
  escrowHoldings: {
    totalHeld: number;
    pendingSellerPayouts: number;
    releasedToSellers: number;
  };
  platformRevenue: {
    total: number;
    last30Days: number;
    transactionFees: { total: number; last30Days: number };
    subscriptionRevenue: { total: number; last30Days: number };
  };
}

interface BackendOrderTrend {
  trend: Array<{ period: string; orders: number; revenue: number; fees: number }>;
}

interface BackendStorePerformance {
  topStores: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    totalOrders: number;
    institution?: string;
  }>;
}

interface BackendProductAnalytics {
  byCategory: Array<{ category: string; count: number }>;
}

// Category palette — rotate for dynamic data
const CAT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#3b82f6', '#f97316', '#14b8a6',
];

// ──────────────────────────────────────────────
// Service class
// ──────────────────────────────────────────────
class AdminDashboardService {
  /**
   * GET /api/v1/admin/dashboard
   * Primary stats shown on the dashboard stat cards.
   */
  async getDashboard(): Promise<DashboardOverview> {
    const res = await api.get('admin/dashboard');
    const d = extractData<{ stats: BackendDashboardStats }>(res);
    const s = d.stats;
    return {
      totalUsers:     s.users.total,
      newUsersMonth:  s.users.newThisMonth,
      newUsersWeek:   s.users.newThisWeek,
      activeUsers:    s.users.activeThisWeek,
      totalStores:    s.stores.total,
      newStoresMonth: s.stores.newThisMonth,
      activeStores:   s.stores.active,
      pendingStores:  s.stores.pending,
      totalOrders:    s.orders.total,
      ordersMonth:    s.orders.thisMonth,
      ordersWeek:     s.orders.thisWeek,
      ordersToday:    s.orders.today,
      totalRevenue:   s.revenue.total,
      monthRevenue:   s.revenue.thisMonth,
      weeklyRevenue:  s.revenue.thisWeek,
      totalFees:      s.revenue.totalFees,
      openDisputes:   s.disputes.open,
      pendingEscrow:  s.escrow.pending,
      totalProducts:  s.products.total,
    };
  }

  /**
   * GET /api/v1/admin/analytics/overview
   * Escrow holdings + platform revenue breakdown.
   */
  async getAnalyticsOverview(): Promise<{
    escrow: EscrowSummary;
    platformRevenue: PlatformRevenueSummary;
  }> {
    const res = await api.get('admin/analytics/overview');
    const d = extractData<BackendAnalyticsOverview>(res);
    return {
      escrow: {
        totalHeld:            d.escrowHoldings.totalHeld,
        pendingSellerPayouts: d.escrowHoldings.pendingSellerPayouts,
        releasedToSellers:    d.escrowHoldings.releasedToSellers,
      },
      platformRevenue: {
        total:               d.platformRevenue.total,
        last30Days:          d.platformRevenue.last30Days,
        transactionFees:     d.platformRevenue.transactionFees.total,
        subscriptionRevenue: d.platformRevenue.subscriptionRevenue.total,
      },
    };
  }

  /**
   * GET /api/v1/admin/analytics/orders?period=:period
   * Revenue & orders trend for the chart.
   */
  async getRevenueTrend(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueDataPoint[]> {
    try {
      const res = await api.get(`admin/analytics/orders?period=${period}`);
      const d = extractData<BackendOrderTrend>(res);
      return (d.trend ?? []).map((p) => ({
        name:    p.period,
        revenue: Number(p.revenue),
        orders:  Number(p.orders),
        fees:    Number(p.fees),
      }));
    } catch {
      return [];
    }
  }

  /**
   * GET /api/v1/admin/analytics/stores?limit=:limit
   * Top performing stores by revenue.
   */
  async getTopStores(limit = 5): Promise<TopStore[]> {
    try {
      const res = await api.get(`admin/analytics/stores?limit=${limit}`);
      const d = extractData<BackendStorePerformance>(res);
      return (d.topStores ?? []).map((s) => ({
        id:          s.id,
        name:        s.name,
        revenue:     `₵${Number(s.totalRevenue).toLocaleString()}`,
        orders:      s.totalOrders,
        institution: s.institution,
      }));
    } catch {
      return [];
    }
  }

  /**
   * GET /api/v1/admin/analytics/products
   * Product breakdown by category for the pie chart.
   */
  async getCategoryBreakdown(): Promise<CategoryDataPoint[]> {
    try {
      const res = await api.get('admin/analytics/products');
      const d = extractData<BackendProductAnalytics>(res);
      return (d.byCategory ?? []).map((c, i) => ({
        name:  c.category,
        value: c.count,
        color: CAT_COLORS[i % CAT_COLORS.length],
      }));
    } catch {
      return [];
    }
  }
}

const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
