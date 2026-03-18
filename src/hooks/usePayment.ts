import { useMutation } from '@tanstack/react-query';
import api, { extractData } from '@/lib/api';

interface PaymentResponse {
  authorizationUrl?: string;
  authorization_url?: string;
  accessCode?: string;
  access_code?: string;
  reference: string;
}

interface VerifyPaymentResponse {
  status: string;
  reference: string;
  amount: number;
}

interface InitializePaymentInput {
  orderId: string;
  callbackUrl?: string;
  paymentMethod?: 'mobile_money' | 'card' | string;
  selectedProvider?: string;
  phoneNumber?: string;
}

export function usePayment() {
  const initializePayment = useMutation({
    mutationFn: async ({
      orderId,
      callbackUrl,
      paymentMethod,
      selectedProvider,
      phoneNumber,
    }: InitializePaymentInput) => {
      const resolvedCallbackUrl =
        callbackUrl || `${window.location.origin}/orders/${orderId}`;

      const response = await api.post(`/orders/${orderId}/pay`, {
        callbackUrl: resolvedCallbackUrl,
        paymentMethod,
        selectedProvider,
        phoneNumber,
      });
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
