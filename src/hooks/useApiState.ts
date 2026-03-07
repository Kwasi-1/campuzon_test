/**
 * Custom Hook for API State Management
 * 
 * Provides loading, error, and data state management for API calls
 */

import { useState, useCallback } from 'react';

interface UseApiStateOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiStateReturn<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Custom hook for managing API call state
 */
export function useApiState<T = unknown>(
  options: UseApiStateOptions<T> = {}
): UseApiStateReturn<T> {
  const { initialData = null, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiCall();
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
    setData,
  };
}