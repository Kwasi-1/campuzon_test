import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import toast from 'react-hot-toast';

export interface AutoResponderConfig {
  enabled: boolean;
  botName: string;
  message: string;
}

export const storeSettingsKeys = {
  all: ['storeSettings'] as const,
  autoResponder: () => [...storeSettingsKeys.all, 'autoResponder'] as const,
};

export function useAutoResponder() {
  return useQuery<AutoResponderConfig>({
    queryKey: storeSettingsKeys.autoResponder(),
    queryFn: async (): Promise<AutoResponderConfig> => {
      const response = await api.get('/store/settings/auto-responder');
      return extractData<AutoResponderConfig>(response);
    },
  });
}

export function useUpdateAutoResponder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AutoResponderConfig) => {
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
