import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Wallet {
  id: string;
  storeID: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  lastWithdrawalAt: string | null;
}

export interface WalletTransaction {
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

// Wallet Query Keys
export const walletKeys = {
  all: ['wallet'] as const,
  summary: () => [...walletKeys.all, 'summary'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

// Get wallet summary (balance, etc.)
export function useWallet() {
  return useQuery<Wallet>({
    queryKey: walletKeys.summary(),
    queryFn: async (): Promise<Wallet> => {
      const response = await api.get('/store/wallet');
      return extractData<Wallet>(response);
    },
  });
}

// Get wallet transactions
export function useWalletTransactions() {
  return useQuery<WalletTransaction[]>({
    queryKey: walletKeys.transactions(),
    queryFn: async (): Promise<WalletTransaction[]> => {
      const response = await api.get('/store/wallet/transactions');
      return extractData<WalletTransaction[]>(response);
    },
  });
}

// Withdraw funds
export function useWithdrawFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { amount: number; accountID: string }) => {
      const response = await api.post('/store/wallet/withdraw', data);
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Withdrawal request submitted successfully');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
