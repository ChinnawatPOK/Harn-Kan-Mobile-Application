import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { PayResponse } from "@/schemas/payment.schema";
import type { Payment, StartPaymentResult } from "@/types/payment.types";

export async function payPayment(paymentId: string): Promise<PayResponse> {
  const { data } = await apiClient.post<PayResponse>(
    endpoints.payments.pay(paymentId),
    undefined,
    { keepRequestKeys: true },
  );
  return data;
}

export async function startPayment(
  paymentId: string,
): Promise<StartPaymentResult> {
  const { data } = await apiClient.post<StartPaymentResult>(
    endpoints.payments.pay(paymentId),
    undefined,
    { keepRequestKeys: true },
  );
  return data;
}

export async function getPayment(paymentId: string): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(
    endpoints.payments.byId(paymentId),
    { keepRequestKeys: true },
  );
  return data;
}
