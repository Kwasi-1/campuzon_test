/**
 * Admin Disputes Service
 * Wraps /api/v1/admin/disputes endpoints using src/lib/api.ts
 */
import { api, extractData } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'
  | 'resolved_seller'
  | 'cancelled'
  | 'closed';

export type ResolutionType =
  | 'buyer_favor'
  | 'seller_favor'
  | 'partial_refund'
  | 'cancelled';

export interface DisputeParty {
  id: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface DisputeOrderItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface DisputeOrder {
  id: string | null;
  status: string | null;
  totalAmount: number;
  serviceFee: number;
  createdAt: string | null;
  paidAt: string | null;
  items: DisputeOrderItem[];
}

export interface DisputeEscrow {
  status: string | null;
  amount: number;
  holdUntil: string | null;
}

export interface DisputeTransaction {
  id: string;
  reference: string;
  amount: number;
  status: string;
  type: string | null;
  date: string | null;
}

export interface ChatMessage {
  id: string;
  conversationID: string;
  senderType: 'buyer' | 'seller' | 'unknown';
  sender: { id: string; name: string; email: string } | null;
  content: string;
  messageType: string;
  attachments: unknown;
  createdAt: string | null;
  isRead: boolean;
}

export interface Dispute {
  id: string;
  orderNumber: string | null;
  orderId: string;
  reason: string;
  description?: string | null;
  evidence?: unknown;
  status: DisputeStatus;
  resolution?: string | null;
  resolvedByID?: string | null;
  resolvedAt?: string | null;
  createdAt: string | null;
  age: number; // days
  amount: number;
  escrowAmount?: number;
  buyer: DisputeParty;
  seller: DisputeParty;
  order?: DisputeOrder;
  escrow?: DisputeEscrow | null;
  transactions?: DisputeTransaction[];
}

export interface DisputeStats {
  byStatus: Record<string, number>;
  byResolution: Record<string, number>;
  averageResolutionDays: number;
  topStoresByDisputes: Array<{ storeId: string; storeName: string; disputeCount: number }>;
}

interface BackendListResponse {
  disputes: Dispute[];
  pagination: { page: number; pages: number; total: number; perPage: number };
}

interface BackendOpenResponse {
  disputes: Dispute[];
  count: number;
}

interface BackendDetailResponse {
  dispute: Dispute;
}

interface BackendConvResponse {
  dispute: { id: string; orderNumber: string };
  conversations: unknown[];
  totalMessages: number;
  messages?: ChatMessage[];
  message?: string;
}

// ─── Service ──────────────────────────────────────────────────

class AdminDisputesService {
  /**
   * GET /api/v1/admin/disputes
   * status: 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'cancelled' | 'closed'
   */
  async getDisputes(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: Dispute[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.status)   qs.set('status',   params.status);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await api.get(`admin/disputes?${qs}`);
    const d = extractData<BackendListResponse>(res);
    return { items: d.disputes ?? [], total: d.pagination?.total ?? 0 };
  }

  /**
   * GET /api/v1/admin/disputes/open
   * Returns all open + under_review disputes (no pagination — used for the urgent queue).
   */
  async getOpenDisputes(): Promise<Dispute[]> {
    const res = await api.get('admin/disputes/open');
    const d = extractData<BackendOpenResponse>(res);
    return d.disputes ?? [];
  }

  /**
   * GET /api/v1/admin/disputes/:id
   */
  async getDispute(disputeId: string): Promise<Dispute> {
    const res = await api.get(`admin/disputes/${disputeId}`);
    const d = extractData<BackendDetailResponse>(res);
    return d.dispute;
  }

  /**
   * POST /api/v1/admin/disputes/:id/resolve
   * resolution: 'buyer_favor' | 'seller_favor' | 'partial_refund' | 'cancelled'
   * notes: optional admin notes
   * refundPercentage: 0-100 (only for partial_refund)
   */
  async resolveDispute(
    disputeId: string,
    resolution: ResolutionType,
    notes?: string,
    refundPercentage?: number,
  ): Promise<{ resolution: string; disputeStatus: string }> {
    const res = await api.post(`admin/disputes/${disputeId}/resolve`, {
      resolution,
      notes,
      ...(resolution === 'partial_refund' && refundPercentage !== undefined
        ? { refundPercentage }
        : {}),
    });
    return extractData<{ resolution: string; disputeStatus: string }>(res);
  }

  /**
   * POST /api/v1/admin/disputes/:id/notes
   * Appends an admin note to the dispute's resolution field.
   */
  async addNote(disputeId: string, notes: string): Promise<void> {
    await api.post(`admin/disputes/${disputeId}/notes`, { notes });
  }

  /**
   * GET /api/v1/admin/disputes/:id/conversation
   * Returns the buyer-seller chat transcript for this dispute's order.
   */
  async getConversation(disputeId: string): Promise<{
    messages: ChatMessage[];
    totalMessages: number;
    note?: string;
  }> {
    const res = await api.get(`admin/disputes/${disputeId}/conversation`);
    const d = extractData<BackendConvResponse>(res);
    return {
      messages: d.messages ?? [],
      totalMessages: d.totalMessages ?? 0,
      note: d.message,
    };
  }

  /**
   * GET /api/v1/admin/disputes/stats
   */
  async getStats(): Promise<DisputeStats> {
    const res = await api.get('admin/disputes/stats');
    return extractData<DisputeStats>(res);
  }
}

const adminDisputesService = new AdminDisputesService();
export default adminDisputesService;
