/**
 * Admin Institutions Service
 * Wraps /api/v1/admin/institutions endpoints using src/lib/api.ts
 */
import { api, extractData } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────

export interface Institution {
  id: string;
  name: string;
  shortName: string | null;
  region: string | null;
  city: string | null;
  campus?: string | null;
  isActive: boolean;
  userCount: number;
  storeCount: number;
  hallCount: number;
  createdAt: string | null;
}

export interface Hall {
  id: string;
  name: string;
  type: 'male' | 'female' | 'mixed' | null;
  isActive: boolean;
  userCount?: number;
  storeCount?: number;
}

export interface InstitutionDetail extends Institution {
  halls: Hall[];
  stats: { userCount: number; storeCount: number; hallCount: number };
}

export interface InstitutionStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalHalls: number;
  topByUsers: Array<{ id: string; name: string; userCount: number }>;
  topByStores: Array<{ id: string; name: string; storeCount: number }>;
}

interface BackendList {
  institutions: Institution[];
  pagination: { page: number; pages: number; total: number; perPage: number };
}

interface BackendDetail {
  institution: InstitutionDetail;
  halls: Hall[];
  stats: { userCount: number; storeCount: number; hallCount: number };
}

interface BackendHalls {
  halls: Hall[];
  institutionName: string;
}

// ─── Service ──────────────────────────────────────────────────

class AdminInstitutionsService {
  // ════════════════════════════════════════════
  //  INSTITUTIONS
  // ════════════════════════════════════════════

  async getInstitutions(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: Institution[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.search)   qs.set('search',   params.search);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await api.get(`admin/institutions?${qs}`);
    const d = extractData<BackendList>(res);
    return { items: d.institutions ?? [], total: d.pagination?.total ?? 0 };
  }

  async getInstitution(id: string): Promise<InstitutionDetail> {
    const res = await api.get(`admin/institutions/${id}`);
    const d = extractData<BackendDetail>(res);
    // backend wraps halls + stats at top level alongside institution
    return {
      ...d.institution,
      halls: d.halls ?? [],
      stats: d.stats ?? { userCount: 0, storeCount: 0, hallCount: 0 },
    };
  }

  async createInstitution(data: {
    name: string;
    shortName?: string;
    region?: string;
    city?: string;
    campus?: string;
  }): Promise<Institution> {
    const res = await api.post('admin/institutions', data);
    const d = extractData<{ institution: Institution }>(res);
    return d.institution;
  }

  async updateInstitution(
    id: string,
    data: Partial<{
      name: string;
      shortName: string;
      region: string;
      city: string;
      campus: string;
      isActive: boolean;
    }>,
  ): Promise<void> {
    await api.put(`admin/institutions/${id}`, data);
  }

  async deleteInstitution(id: string): Promise<void> {
    await api.delete(`admin/institutions/${id}`);
  }

  async toggleInstitutionActive(id: string, isActive: boolean): Promise<void> {
    await this.updateInstitution(id, { isActive });
  }

  // ════════════════════════════════════════════
  //  HALLS
  // ════════════════════════════════════════════

  async getHalls(institutionId: string): Promise<{ halls: Hall[]; institutionName: string }> {
    const res = await api.get(`admin/institutions/${institutionId}/halls`);
    const d = extractData<BackendHalls>(res);
    return { halls: d.halls ?? [], institutionName: d.institutionName ?? '' };
  }

  async createHall(
    institutionId: string,
    data: { name: string; type?: 'male' | 'female' | 'mixed' },
  ): Promise<Hall> {
    const res = await api.post(`admin/institutions/${institutionId}/halls`, data);
    const d = extractData<{ hall: Hall }>(res);
    return d.hall;
  }

  async updateHall(
    hallId: string,
    data: Partial<{ name: string; type: string; isActive: boolean }>,
  ): Promise<void> {
    await api.put(`admin/institutions/halls/${hallId}`, data);
  }

  async deleteHall(hallId: string): Promise<void> {
    await api.delete(`admin/institutions/halls/${hallId}`);
  }

  async toggleHallActive(hallId: string, isActive: boolean): Promise<void> {
    await this.updateHall(hallId, { isActive });
  }

  // ════════════════════════════════════════════
  //  STATS
  // ════════════════════════════════════════════

  async getStats(): Promise<InstitutionStats> {
    const res = await api.get('admin/institutions/stats');
    return extractData<InstitutionStats>(res);
  }
}

const adminInstitutionsService = new AdminInstitutionsService();
export default adminInstitutionsService;
