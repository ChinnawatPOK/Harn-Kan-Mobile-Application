import { useQuery } from "@tanstack/react-query";

import { getNearbyDeals } from "@/services/deal.service";
import type { NearbyDealsParams } from "@/types/deal.types";
import { useAuthStore } from "@/stores/auth.store";

export const nearbyDealsQueryKey = ["nearby-deals"] as const;

export function useNearbyDeals(params: NearbyDealsParams) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: [...nearbyDealsQueryKey, params],
    queryFn: () => getNearbyDeals(params),
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });
}
