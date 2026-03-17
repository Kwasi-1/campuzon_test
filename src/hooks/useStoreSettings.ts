import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import {
  normalizeSellerAutoResponderConfig,
  type SellerAutoResponderConfig,
} from '@/types-new';
import toast from 'react-hot-toast';

export const storeSettingsKeys = {
  all: ['storeSettings'] as const,
  autoResponder: () => [...storeSettingsKeys.all, 'autoResponder'] as const,
};

export function useAutoResponder() {
  return useQuery<SellerAutoResponderConfig>({
    queryKey: storeSettingsKeys.autoResponder(),
    queryFn: async (): Promise<SellerAutoResponderConfig> => {
      const response = await api.get('/store/settings/auto-responder');
      const data = extractData<unknown>(response);
      return normalizeSellerAutoResponderConfig(data);
    },
  });
}

export function useUpdateAutoResponder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SellerAutoResponderConfig) => {
      const response = await api.put('/store/settings/auto-responder', data);
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeSettingsKeys.autoResponder() });
      toast.success('Auto-responder settings updated');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
