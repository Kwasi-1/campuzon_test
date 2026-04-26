import { useQuery } from "@tanstack/react-query";
import api, { extractData } from "@/lib/api";
import type { Institution, Hall } from "@/types-new";

export const institutionKeys = {
  all: ["institutions"] as const,
  halls: (institutionId?: string) => ["institutions", institutionId, "halls"] as const,
};

export function useInstitutions() {
  return useQuery({
    queryKey: institutionKeys.all,
    queryFn: async () => {
      const response = await api.get("/user/institutions");
      return extractData<{ institutions: Institution[] }>(response).institutions;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (institutions rarely change)
  });
}

export function useHalls(institutionId?: string | null) {
  return useQuery({
    queryKey: institutionKeys.halls(institutionId ?? undefined),
    queryFn: async () => {
      if (!institutionId) return [];
      const response = await api.get(`/user/institutions/${institutionId}/halls`);
      return extractData<{ halls: Hall[] }>(response).halls;
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
