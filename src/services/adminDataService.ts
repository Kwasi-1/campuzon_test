/**
 * Admin Data Service – Users & Stores
 * Uses src/lib/api.ts + extractData. Correct backend API endpoints.
 */
import { api, extractData, extractError } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────

export interface AdminUserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  profileImage: string | null;
  dateCreated: string;
  lastLogin: string | null;
  institution?: string;
  hall?: string;
  // Stats added by the detail endpoint
  totalOrders?: number;
  totalSpent?: number;
}

export interface AdminStoreItem {
  id: string;
  storeName: string;
  storeSlug: string;
  email: string;
  phoneNumber: string;
  status: string;           // 'active' | 'pending' | 'suspended' | 'rejected' | 'closed'
  rating: number;
  productCount: number;
  totalOrders: number;
  totalRevenue: number;
  dateCreated: string;
  logoUrl: string | null;
  isVerified: boolean;
  owner: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | null;
  institution?: string;
  institutionName?: string;
  hall?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

// Paginated wrapper the server wraps lists in
interface Paginated<T> {
  items: T[];
  pagination: { page: number; pages: number; total: number; perPage: number };
}

type UsersResponse = {
  users?: AdminUserItem[];
  pagination?: {
    page?: number;
    perPage?: number;
    total?: number;
    pages?: number;
  };
};

type StoresResponse = {
  stores?: AdminStoreItem[];
  pagination?: {
    page?: number;
    perPage?: number;
    total?: number;
    pages?: number;
  };
};

// ─── Admin Data Service ───────────────────────────────────────

class AdminDataService {
  // ════════════════════════════════════════════
  //  USERS
  // ════════════════════════════════════════════

  /**
   * GET /api/v1/admin/users
   * Supports: search, role, status (active|inactive|suspended), sort, page, per_page
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: AdminUserItem[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.search)   qs.set('search',   params.search);
    if (params?.role)     qs.set('role',     params.role);
    if (params?.status)   qs.set('status',   params.status);
    if (params?.sort)     qs.set('sort',     params.sort);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await api.get(`admin/users?${qs}`);
    const d = extractData<UsersResponse | Paginated<AdminUserItem>>(res);

    if ('items' in d) {
      return { items: d.items ?? [], total: d.pagination?.total ?? 0 };
    }

    return {
      items: d.users ?? [],
      total: d.pagination?.total ?? (d.users?.length ?? 0),
    };
  }

  /** GET /api/v1/admin/users/:id */
  async getUserById(userId: string): Promise<AdminUserItem> {
    const res = await api.get(`admin/users/${userId}`);
    const d = extractData<{ user?: AdminUserItem } | AdminUserItem>(res);
    return (
      (d && typeof d === 'object' && 'user' in d ? d.user : d) as AdminUserItem
    );
  }

  /**
   * POST /api/v1/admin/users/:id/suspend
   * body: { reason, duration_days? }
   */
  async suspendUser(userId: string, reason: string, durationDays?: number): Promise<void> {
    await api.post(`admin/users/${userId}/suspend`, {
      reason,
      ...(durationDays ? { durationDays } : {}),
    });
  }

  /**
   * POST /api/v1/admin/users/:id/unsuspend
   */
  async unsuspendUser(userId: string): Promise<void> {
    await api.post(`admin/users/${userId}/unsuspend`);
  }

  /**
   * POST /api/v1/admin/users/:id/verify
   */
  async verifyUser(userId: string): Promise<void> {
    await api.post(`admin/users/${userId}/verify`);
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   * body: { role }
   */
  async changeUserRole(userId: string, role: string): Promise<void> {
    await api.patch(`admin/users/${userId}/role`, { role });
  }

  // ════════════════════════════════════════════
  //  STORES
  // ════════════════════════════════════════════

  /**
   * GET /api/v1/admin/stores
   * Supports: search, status, institution_id, sort, page, per_page
   */
  async getStores(params?: {
    search?: string;
    status?: string;
    institution_id?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: AdminStoreItem[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.search)         qs.set('search',         params.search);
    if (params?.status)         qs.set('status',         params.status);
    if (params?.institution_id) qs.set('institution_id', params.institution_id);
    if (params?.sort)           qs.set('sort',           params.sort);
    if (params?.page)           qs.set('page',           String(params.page));
    if (params?.per_page)       qs.set('per_page',       String(params.per_page));

    const res = await api.get(`admin/stores?${qs}`);
    const d = extractData<StoresResponse | Paginated<AdminStoreItem>>(res);

    if ('items' in d) {
      return { items: d.items ?? [], total: d.pagination?.total ?? 0 };
    }

    return {
      items: d.stores ?? [],
      total: d.pagination?.total ?? (d.stores?.length ?? 0),
    };
  }

  /** GET /api/v1/admin/stores/:id */
  async getStoreById(storeId: string): Promise<AdminStoreItem> {
    const res = await api.get(`admin/stores/${storeId}`);
    const d = extractData<{ store?: AdminStoreItem } | AdminStoreItem>(res);
    return (
      (d && typeof d === 'object' && 'store' in d ? d.store : d) as AdminStoreItem
    );
  }

  /** POST /api/v1/admin/stores/:id/approve */
  async approveStore(storeId: string): Promise<void> {
    await api.post(`admin/stores/${storeId}/approve`);
  }

  /** POST /api/v1/admin/stores/:id/reject   body: { reason } */
  async rejectStore(storeId: string, reason: string): Promise<void> {
    await api.post(`admin/stores/${storeId}/reject`, { reason });
  }

  /** POST /api/v1/admin/stores/:id/suspend  body: { reason, duration_days? } */
  async suspendStore(storeId: string, reason: string, durationDays?: number): Promise<void> {
    await api.post(`admin/stores/${storeId}/suspend`, {
      reason,
      ...(durationDays ? { durationDays } : {}),
    });
  }

  /** POST /api/v1/admin/stores/:id/unsuspend */
  async unsuspendStore(storeId: string): Promise<void> {
    await api.post(`admin/stores/${storeId}/unsuspend`);
  }

  /** POST /api/v1/admin/stores/:id/verify */
  async verifyStore(storeId: string): Promise<void> {
    await api.post(`admin/stores/${storeId}/verify`);
  }

  // Compatibility aliases used by some existing admin UI pages.
  async getStalls(params?: {
    search?: string;
    status?: string;
    institution_id?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }) {
    return this.getStores(params);
  }

  async approveStall(storeId: string) {
    return this.approveStore(storeId);
  }

  async rejectStall(storeId: string, reason: string) {
    return this.rejectStore(storeId, reason);
  }

  async suspendStall(storeId: string, reason: string, durationDays?: number) {
    return this.suspendStore(storeId, reason, durationDays);
  }

  async activateStall(storeId: string) {
    return this.unsuspendStore(storeId);
  }
}

export const extractErr = extractError;

const adminDataService = new AdminDataService();
export default adminDataService;
