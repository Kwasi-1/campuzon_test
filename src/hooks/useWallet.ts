import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import {
  normalizeSellerWallet,
  normalizeSellerWalletTransactionArray,
  type SellerWallet,
  type SellerWalletTransaction,
} from '@/types-new';
import toast from 'react-hot-toast';

// Wallet Query Keys
export const walletKeys = {
  all: ['wallet'] as const,
  summary: () => [...walletKeys.all, 'summary'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

// Get wallet summary (balance, etc.)
export function useWallet() {
  return useQuery<SellerWallet>({
    queryKey: walletKeys.summary(),
    queryFn: async (): Promise<SellerWallet> => {
      const response = await api.get('/store/wallet');
      const data = extractData<unknown>(response);
      return normalizeSellerWallet(data);
    },
  });
}

// Get wallet transactions
export function useWalletTransactions() {
  return useQuery<SellerWalletTransaction[]>({
    queryKey: walletKeys.transactions(),
    queryFn: async (): Promise<SellerWalletTransaction[]> => {
      const response = await api.get('/store/wallet/transactions');
      const data = extractData<{ items?: unknown[]; transactions?: unknown[] } | unknown[]>(response);
      if (Array.isArray(data)) {
        return normalizeSellerWalletTransactionArray(data);
      }
      return normalizeSellerWalletTransactionArray(data.items || data.transactions || []);
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
