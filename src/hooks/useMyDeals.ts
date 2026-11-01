import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyDeals } from "@/services/deal.service";
import type { DealCategory, DealRole, MyDealsTab } from "@/types/deal.types";
import { useAuthStore } from "@/stores/auth.store";

export const myDealsQueryKey = ["my-deals"] as const;

export type MyDealsFilters = {
  tab: MyDealsTab;
  category?: DealCategory;
  role?: DealRole;
};

const pageSize = 20;

export function useMyDeals(filters: MyDealsFilters) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useInfiniteQuery({
    queryKey: [...myDealsQueryKey, filters],
    queryFn: ({ pageParam }) =>
      getMyDeals({ ...filters, page: pageParam, size: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.size + lastPage.items.length < lastPage.total
        ? lastPage.page + 1
        : undefined,
    enabled: Boolean(accessToken),
  });
}
