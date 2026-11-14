import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useRef } from "react";

import { type DealScreen, dealScreenFor } from "@/lib/deal-routing";
import type { MyDealsParams, NearbyDealsParams } from "@/schemas/deal.schema";
import {
  cancelDeal,
  confirmReceipt,
  createDeal,
  getDeal,
  getDealReceipt,
  getMyDeals,
  getNearbyDeals,
  joinDeal,
  leaveDeal,
} from "@/services/deal.service";
import { payPayment } from "@/services/payment.service";
import { useAuthStore } from "@/stores/auth.store";
import { useLocationStore } from "@/stores/location.store";

const DEAL_POLL_INTERVAL_MS = 10_000;
const NEARBY_POLL_INTERVAL_MS = 1_000;

export const dealsQueryKey = ["deals"] as const;
export const dealQueryKey = (dealId: string) => ["deal", dealId] as const;
export const nearbyDealsQueryKey = (params: NearbyDealsParams) =>
  [...dealsQueryKey, "nearby", params] as const;
export const myDealsQueryKey = (params: MyDealsParams) =>
  [...dealsQueryKey, "mine", params] as const;

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeal,
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(deal.id), deal);
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

export function useJoinDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinDeal,
    onSuccess: ({ deal }) => {
      queryClient.setQueryData(dealQueryKey(deal.id), deal);
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

export function useLeaveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveDeal,
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(deal.id), deal);
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

export function useCancelDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelDeal,
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(deal.id), deal);
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

export function useConfirmReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmReceipt,
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(deal.id), deal);
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

export function usePayDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId }: { paymentId: string; dealId: string }) =>
      payPayment(paymentId),
    // Pay answers with the payment only, so reload the deal for me.status.
    onSettled: (_data, _error, { dealId }) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKey(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
    },
  });
}

function fetchDeal(dealId: string) {
  // Viewer position is optional; it only fills in distanceMeters.
  const coordinates = useLocationStore.getState().coordinates;
  return getDeal(
    dealId,
    coordinates
      ? { lat: coordinates.latitude, lng: coordinates.longitude }
      : undefined,
  );
}

/** Starts loading a deal before its screen opens, so it renders without a spinner. */
export function usePrefetchDeal() {
  const queryClient = useQueryClient();
  return useCallback(
    (dealId: string) =>
      void queryClient.prefetchQuery({
        queryKey: dealQueryKey(dealId),
        queryFn: () => fetchDeal(dealId),
      }),
    [queryClient],
  );
}

export function useResolveDealScreen() {
  const queryClient = useQueryClient();
  return useCallback(
    async (dealId: string): Promise<DealScreen> => {
      try {
        const deal = await queryClient.fetchQuery({
          queryKey: dealQueryKey(dealId),
          queryFn: () => fetchDeal(dealId),
        });
        return dealScreenFor(deal);
      } catch {
        // /deal/[id] shows the error with a retry.
        return "/deal/[id]";
      }
    },
    [queryClient],
  );
}

export function useDeal(dealId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isFocused = useIsFocused();
  const query = useQuery({
    queryKey: dealQueryKey(dealId ?? ""),
    queryFn: () => fetchDeal(dealId!),
    enabled: Boolean(accessToken && dealId),
    refetchOnWindowFocus: isFocused,
    // Poll only the deal on screen, and stop once it reaches a final state
    // (cancelled/expired deals keep polling until every refund lands).
    refetchInterval: (query) => {
      const deal = query.state.data;
      if (!isFocused || !deal) return false;
      const isOpen = deal.status === "ACTIVE" || deal.status === "LOCKED";
      const isRefunding = deal.participants.some(
        (participant) => participant.status === "REFUND_PENDING",
      );
      return isOpen || isRefunding ? DEAL_POLL_INTERVAL_MS : false;
    },
  });

  // Coming back to this screen (e.g. from the pay modal) shows fresh data.
  // The first focus is the mount, which useQuery already covers, and
  // cancelRefetch: false joins a request in flight (a prefetch, or the
  // previous screen's before a <Redirect>) instead of restarting it.
  const { refetch } = query;
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      if (accessToken && dealId) void refetch({ cancelRefetch: false });
    }, [accessToken, dealId, refetch]),
  );

  return query;
}

export function useNearbyDeals(params: NearbyDealsParams | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isFocused = useIsFocused();
  return useQuery({
    // Disabled until the device location is known.
    queryKey: nearbyDealsQueryKey(params ?? { lat: 0, lng: 0 }),
    queryFn: () => getNearbyDeals(params!),
    enabled: Boolean(accessToken && params),
    placeholderData: keepPreviousData,
    // Poll only while the Explore tab is on screen; focusManager also pauses
    // it while the app is in the background.
    refetchInterval: isFocused ? NEARBY_POLL_INTERVAL_MS : false,
  });
}

export function useMyDeals(params: MyDealsParams) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: myDealsQueryKey(params),
    queryFn: () => getMyDeals(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });
}

export function useDealReceipt(dealId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: [...dealQueryKey(dealId ?? ""), "receipt"],
    queryFn: () => getDealReceipt(dealId!),
    enabled: Boolean(accessToken && dealId),
  });
}
