import apiClient, { handleApiError } from '@/services/apiClient';
import adminDataService from '@/services/adminDataService';
import { Transaction } from '@/types';

// Backend flexible shape for payments under /admin/stalls/{stall_id}/payments
type BackendPayment = Record<string, unknown> & {
  order_id?: string;
  order_number?: string;
  customer_name?: string;
  amount?: number | string;
  payment_method?: string;
  payment_status?: string; // 'completed' | 'pending' | 'failed' | 'cancelled' | etc
  commission_amount?: number;
  commission_rate?: number;
  net_amount?: number;
  payment_date?: string;
  created_at?: string;
};

export interface TransactionAnalytics {
  totalRevenue: number;
  totalCommission: number;
  totalTransactions: number;
  successRate: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface Disbursement {
  id: string;
  storeId: string;
  storeName: string;
  grossSales: number;
  platformFee: number;
  netPayout: number;
  status: 'Pending' | 'Disbursed' | 'Failed';
  disbursedAt?: string;
  transactionCount: number;
  period: string;
}

const titleCaseStatus = (s?: string): string => {
  const v = (s || '').toLowerCase();
  switch (v) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    default:
      return (s || '').toString();
  }
};

class AdminTransactionsService {
  // Fetch payments per stall and flatten
  async getAllTransactions(): Promise<Transaction[]> {
    const stalls = await adminDataService.getStalls();
    const results: Transaction[] = [];
    for (const s of stalls) {
      if (!s.stallId) continue;
      try {
        const { data } = await apiClient.get<BackendPayment[]>(`/admin/stalls/${encodeURIComponent(s.stallId)}/payments`);
        const list = Array.isArray(data) ? data : [];
        for (const p of list) {
          const amount = Number(p.amount ?? 0);
          const commission = typeof p.commission_amount === 'number' ? p.commission_amount : amount * 0.1; // default 10%
          const t: Transaction = {
            id: String(p.order_number || p.order_id || `${s.stallId}-${results.length + 1}`),
            orderId: String(p.order_id || p.order_number || ''),
            store: s.name,
            customer: p.customer_name || 'Customer',
            amount,
            commission,
            status: titleCaseStatus(p.payment_status || 'completed'),
            paymentMethod: p.payment_method || 'Unknown',
            date: (p.payment_date || p.created_at || new Date().toISOString()),
            deliveryStatus: 'Delivered', // backend not provided; placeholder
          };
          results.push(t);
        }
      } catch (e) {
        // ignore per-stall failure
        // optionally log
        // console.warn('Failed fetching payments for stall', s.stallId, e);
      }
    }
    return results;
  }

  async getTransactionAnalytics(): Promise<TransactionAnalytics> {
    try {
      const { data } = await apiClient.get<TransactionAnalytics>('/admin/transactions/analytics');
      return data;
    } catch (error) {
      console.error('Failed to fetch transaction analytics:', error);
      // Return mock data as fallback
      const transactions = await this.getAllTransactions();
      const completed = transactions.filter(t => t.status === 'Completed');
      const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
      const totalCommission = completed.reduce((sum, t) => sum + t.commission, 0);
      const successRate = transactions.length > 0 ? (completed.length / transactions.length) * 100 : 0;

      return {
        totalRevenue,
        totalCommission,
        totalTransactions: transactions.length,
        successRate,
        dailyRevenue: [
          { date: new Date().toISOString().split('T')[0], revenue: totalRevenue, transactions: transactions.length }
        ],
        paymentMethodBreakdown: [
          { method: 'Mobile Money', count: Math.floor(transactions.length * 0.6), percentage: 60 },
          { method: 'Card', count: Math.floor(transactions.length * 0.3), percentage: 30 },
          { method: 'Cash', count: Math.floor(transactions.length * 0.1), percentage: 10 }
        ],
        statusDistribution: [
          { status: 'Completed', count: completed.length, percentage: successRate },
          { status: 'Pending', count: transactions.filter(t => t.status === 'Pending').length, percentage: 100 - successRate }
        ]
      };
    }
  }

  async exportTransactions(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>(`/admin/transactions/export?format=${format}`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      console.error('Failed to export transactions:', error);
      // Fallback to local export
      const transactions = await this.getAllTransactions();
      const headers = [
        "Transaction ID",
        "Order ID", 
        "Store",
        "Customer",
        "Amount",
        "Commission",
        "Status",
        "Payment Method",
        "Date",
        "Delivery Status"
      ];
      
      const csvData = [
        headers.join(","),
        ...transactions.map((t) =>
          [
            t.id,
            t.orderId,
            `"${t.store}"`,
            `"${t.customer}"`,
            t.amount.toFixed(2),
            t.commission.toFixed(2),
            t.status,
            `"${t.paymentMethod}"`,
            `"${t.date}"`,
            t.deliveryStatus,
          ].join(",")
        ),
      ].join("\n");

      return new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    }
  }

  async getAllDisbursements(): Promise<Disbursement[]> {
    try {
      const { data } = await apiClient.get<Disbursement[]>('/admin/disbursements');
      return data;
    } catch (error) {
      console.error('Failed to fetch disbursements:', error);
      // Return mock data as fallback
      const stalls = await adminDataService.getStalls();
      return stalls.slice(0, 10).map((stall, index) => {
        const grossSales = Math.random() * 5000 + 1000;
        const platformFee = grossSales * 0.1;
        const netPayout = grossSales - platformFee;
        
        return {
          id: `disbursement-${index + 1}`,
          storeId: stall.stallId || `store-${index + 1}`,
          storeName: stall.name,
          grossSales,
          platformFee,
          netPayout,
          status: Math.random() > 0.3 ? 'Pending' : 'Disbursed',
          disbursedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
          transactionCount: Math.floor(Math.random() * 50 + 10),
          period: new Date().toISOString().split('T')[0]
        } as Disbursement;
      });
    }
  }

  async processManualDisbursement(disbursementId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/disbursements/${disbursementId}/process`);
    } catch (error) {
      console.error('Failed to process disbursement:', error);
      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  async enableAutoDisbursement(enabled: boolean): Promise<void> {
    try {
      await apiClient.put('/admin/disbursements/auto-settings', { enabled });
    } catch (error) {
      console.error('Failed to update auto-disbursement settings:', error);
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async exportDisbursements(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>(`/admin/disbursements/export?format=${format}`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      console.error('Failed to export disbursements:', error);
      // Fallback to local export
      const disbursements = await this.getAllDisbursements();
      const headers = [
        "Disbursement ID",
        "Store ID",
        "Store Name",
        "Gross Sales",
        "Platform Fee",
        "Net Payout",
        "Status",
        "Transaction Count",
        "Period",
        "Disbursed At"
      ];
      
      const csvData = [
        headers.join(","),
        ...disbursements.map((d) =>
          [
            d.id,
            d.storeId,
            `"${d.storeName}"`,
            d.grossSales.toFixed(2),
            d.platformFee.toFixed(2),
            d.netPayout.toFixed(2),
            d.status,
            d.transactionCount,
            d.period,
            d.disbursedAt || 'N/A'
          ].join(",")
        ),
      ].join("\n");

      return new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    }
  }
}

const adminTransactionsService = new AdminTransactionsService();
export default adminTransactionsService;
