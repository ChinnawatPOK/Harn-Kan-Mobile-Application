import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { PayResponse } from "@/schemas/payment.schema";

export async function payPayment(paymentId: string): Promise<PayResponse> {
  const { data } = await apiClient.post<PayResponse>(
    endpoints.payments.pay(paymentId),
  );
  if (!/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(data.clientSecret ?? "")) {
    throw new Error("The server did not return a valid Stripe payment.");
  }
  return data;
}
