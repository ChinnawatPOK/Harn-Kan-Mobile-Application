import { useMutation, useQueryClient } from "@tanstack/react-query";

import { nearbyDealsQueryKey } from "@/hooks/useNearbyDeals";
import { myDealsQueryKey } from "@/hooks/useMyDeals";
import { createDeal } from "@/services/deal.service";

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeal,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: nearbyDealsQueryKey }),
        queryClient.invalidateQueries({ queryKey: myDealsQueryKey }),
      ]);
    },
  });
}
