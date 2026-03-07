import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { extractData } from '@/lib/api';
import type { ApiResponse } from '@/types-new';

interface PaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyPaymentResponse {
  status: string;
  reference: string;
  amount: number;
}

export function usePayment() {
  const queryClient = useQueryClient();

  const initializePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/pay`);
      return extractData<PaymentResponse>(response);
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      const response = await api.post('/orders/payment/verify', {
        reference,
      });
      return extractData<VerifyPaymentResponse>(response);
    },
  });

  return {
    initializePayment,
    verifyPayment,
  };
}
