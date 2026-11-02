import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useFocusEffect, useIsFocused } from "expo-router";
import { useCallback } from "react";

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

export function useDeal(dealId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isFocused = useIsFocused();
  const query = useQuery({
    queryKey: dealQueryKey(dealId ?? ""),
    queryFn: () => {
      // Viewer position is optional; it only fills in distanceMeters.
      const coordinates = useLocationStore.getState().coordinates;
      return getDeal(
        dealId!,
        coordinates
          ? { lat: coordinates.latitude, lng: coordinates.longitude }
          : undefined,
      );
    },
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
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (accessToken && dealId) void refetch();
    }, [accessToken, dealId, refetch]),
  );

  return query;
}

export function useNearbyDeals(params: NearbyDealsParams | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    // Disabled until the device location is known.
    queryKey: nearbyDealsQueryKey(params ?? { lat: 0, lng: 0 }),
    queryFn: () => getNearbyDeals(params!),
    enabled: Boolean(accessToken && params),
    placeholderData: keepPreviousData,
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
