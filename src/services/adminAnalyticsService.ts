/**
 * Admin Analytics Service
 * Wraps /api/v1/admin/analytics/* endpoints
 */
import { api, extractData } from '@/lib/api';

export type Period = '7d' | '30d' | '90d' | '1y';

// ─── Overview ─────────────────────────────────────────────────

export interface OverviewData {
  totals: { users: number; stores: number; products: number; orders: number };
  orderRevenue:    { total: number; last30Days: number };
  escrowHoldings:  { totalHeld: number; pendingSellerPayouts: number; releasedToSellers: number };
  platformRevenue: {
    total: number; last30Days: number;
    transactionFees: { total: number; last30Days: number };
    subscriptions:   { total: number; last30Days: number };
  };
  last30Days: { newUsers: number; newOrders: number; orderRevenue: number; platformRevenue: number };
}

// ─── Revenue ──────────────────────────────────────────────────

export interface RevenueChartPoint { label: string; revenue: number; serviceFees: number; orderCount: number }
export interface RevenueSummary { totalRevenue: number; totalServiceFees: number; totalOrders: number; averageOrderValue: number }
export interface RevenueData { period: Period; chart: RevenueChartPoint[]; summary: RevenueSummary }

// ─── Platform Revenue ─────────────────────────────────────────

export interface PlatformRevenueData {
  period: Period;
  summary: {
    totalPlatformRevenue: number;
    transactionFees: { total: number; buyerFees: number; sellerCommissions: number; transactionCount: number };
    subscriptions:   { total: number; subscriptionCount: number };
  };
  chart: Array<{ date: string; transactionFees: number; subscriptions: number }>;
  topStores: Array<{ storeName: string; revenue: number }>;
}

// ─── Users ────────────────────────────────────────────────────

export interface UserAnalyticsData {
  growth: Array<{ date: string; count: number }>;
  byRole: Record<string, number>;
  stats: { total: number; verified: number; verificationRate: number; activeUsers: number; usersWithStores: number; usersWithOrders: number };
}

// ─── Orders ───────────────────────────────────────────────────

export interface OrderAnalyticsData {
  trend: Array<{ date: string; count: number; revenue: number }>;
  byStatus: Record<string, number>;
  metrics: { total: number; completed: number; cancelled: number; completionRate: number; cancellationRate: number; avgFulfillmentDays: number };
}

// ─── Products ─────────────────────────────────────────────────

export interface ProductAnalyticsData {
  byStatus: Record<string, number>;
  topProducts: Array<{ id: string; name: string; totalSold: number; revenue: number }>;
  byCategory: Array<{ category: string; count: number }>;
  metrics: { avgPrice: number; avgRating: number; lowStockCount: number };
}

// ─── Stores ───────────────────────────────────────────────────

export interface StoreAnalyticsData {
  byStatus: Record<string, number>;
  topByRevenue: Array<{ id: string; name: string; revenue: number; orderCount: number }>;
  topByRating:  Array<{ id: string; name: string; rating: number; reviewCount: number }>;
  metrics: { verified: number; totalActive: number; verificationRate: number };
}

// ─── Escrow Holdings ─────────────────────────────────────────

export interface EscrowHoldingsData {
  period: Period;
  summary: {
    currentlyHeld:   { totalAmount: number; forSellers: number; orderCount: number };
    upcomingReleases:{ amount: number; count: number };
    released:        { totalAmount: number; orderCount: number };
    refunded:        { totalAmount: number; orderCount: number };
    disputed:        { totalAmount: number; orderCount: number };
  };
  recentReleases: Array<{ date: string; releasedToSellers: number; count: number }>;
}

// ─── Geography ────────────────────────────────────────────────

export interface GeographyData {
  usersByInstitution:  Array<{ id: string; name: string; userCount: number }>;
  ordersByInstitution: Array<{ id: string; name: string; orderCount: number; revenue: number }>;
  storesByInstitution: Array<{ id: string; name: string; storeCount: number }>;
}

// ─── Service ──────────────────────────────────────────────────

class AdminAnalyticsService {
  async getOverview(): Promise<OverviewData> {
    const res = await api.get('admin/analytics/overview');
    return extractData<OverviewData>(res);
  }

  async getRevenue(period: Period = '30d'): Promise<RevenueData> {
    const res = await api.get(`admin/analytics/revenue?period=${period}`);
    return extractData<RevenueData>(res);
  }

  async getPlatformRevenue(period: Period = '30d'): Promise<PlatformRevenueData> {
    const res = await api.get(`admin/analytics/platform-revenue?period=${period}`);
    return extractData<PlatformRevenueData>(res);
  }

  async getUserAnalytics(period: Period = '30d'): Promise<UserAnalyticsData> {
    const res = await api.get(`admin/analytics/users?period=${period}`);
    return extractData<UserAnalyticsData>(res);
  }

  async getOrderAnalytics(period: Period = '30d'): Promise<OrderAnalyticsData> {
    const res = await api.get(`admin/analytics/orders?period=${period}`);
    return extractData<OrderAnalyticsData>(res);
  }

  async getProductAnalytics(): Promise<ProductAnalyticsData> {
    const res = await api.get('admin/analytics/products');
    return extractData<ProductAnalyticsData>(res);
  }

  async getStoreAnalytics(): Promise<StoreAnalyticsData> {
    const res = await api.get('admin/analytics/stores');
    return extractData<StoreAnalyticsData>(res);
  }

  async getEscrowHoldings(period: Period = '30d'): Promise<EscrowHoldingsData> {
    const res = await api.get(`admin/analytics/escrow-holdings?period=${period}`);
    return extractData<EscrowHoldingsData>(res);
  }

  async getGeography(): Promise<GeographyData> {
    const res = await api.get('admin/analytics/geography');
    return extractData<GeographyData>(res);
  }
}

const adminAnalyticsService = new AdminAnalyticsService();
export default adminAnalyticsService;
