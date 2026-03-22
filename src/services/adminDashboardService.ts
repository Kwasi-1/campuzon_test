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
    subscriptions: { total: number; last30Days: number };
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
    const s = extractData<BackendDashboardStats>(res);
    return {
      totalUsers:     s.users?.total ?? 0,
      newUsersMonth:  s.users?.newThisMonth ?? 0,
      newUsersWeek:   s.users?.newThisWeek ?? 0,
      activeUsers:    s.users?.activeThisWeek ?? 0,
      totalStores:    s.stores?.total ?? 0,
      newStoresMonth: s.stores?.newThisMonth ?? 0,
      activeStores:   s.stores?.active ?? 0,
      pendingStores:  s.stores?.pending ?? 0,
      totalOrders:    s.orders?.total ?? 0,
      ordersMonth:    s.orders?.thisMonth ?? 0,
      ordersWeek:     s.orders?.thisWeek ?? 0,
      ordersToday:    s.orders?.today ?? 0,
      totalRevenue:   s.revenue?.total ?? 0,
      monthRevenue:   s.revenue?.thisMonth ?? 0,
      weeklyRevenue:  s.revenue?.thisWeek ?? 0,
      totalFees:      s.revenue?.totalFees ?? 0,
      openDisputes:   s.disputes?.open ?? 0,
      pendingEscrow:  s.escrow?.pending ?? 0,
      totalProducts:  s.products?.total ?? 0,
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
        transactionFees:     d.platformRevenue.transactionFees?.total ?? 0,
        subscriptionRevenue: d.platformRevenue.subscriptions?.total ?? 0,
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
