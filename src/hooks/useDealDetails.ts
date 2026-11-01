import { useQuery } from "@tanstack/react-query";

import { getDeal, getDealReceipt } from "@/services/deal.service";
import { getPayment } from "@/services/payment.service";
import { useAuthStore } from "@/stores/auth.store";

export const dealDetailQueryKey = (dealId: string) =>
  ["deal", dealId] as const;
export const dealReceiptQueryKey = (dealId: string) =>
  ["deal-receipt", dealId] as const;
export const paymentQueryKey = (paymentId: string) =>
  ["payment", paymentId] as const;

export function useDealDetails(dealId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: dealDetailQueryKey(dealId ?? ""),
    queryFn: () => {
      if (!dealId) {
        throw new Error("A deal ID is required.");
      }

      return getDeal(dealId);
    },
    enabled: Boolean(accessToken && dealId),
    refetchInterval: 15_000,
  });
}

export function useDealReceipt(dealId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: dealReceiptQueryKey(dealId ?? ""),
    queryFn: () => {
      if (!dealId) {
        throw new Error("A deal ID is required.");
      }

      return getDealReceipt(dealId);
    },
    enabled: Boolean(accessToken && dealId),
  });
}

export function usePaymentDetails(paymentId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: paymentQueryKey(paymentId ?? ""),
    queryFn: () => {
      if (!paymentId) {
        throw new Error("A payment ID is required.");
      }

      return getPayment(paymentId);
    },
    enabled: Boolean(accessToken && paymentId),
    refetchInterval: (query) =>
      query.state.data?.status === "PAYMENT_PENDING" ? 5_000 : false,
  });
}
