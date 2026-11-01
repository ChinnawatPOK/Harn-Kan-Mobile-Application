import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { Payment, StartPaymentResult } from "@/types/payment.types";

export async function startPayment(
  paymentId: string,
): Promise<StartPaymentResult> {
  const { data } = await apiClient.post<StartPaymentResult>(
    endpoints.payments.pay(paymentId),
  );
  return data;
}

export async function getPayment(paymentId: string): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(
    endpoints.payments.byId(paymentId),
  );
  return data;
}
