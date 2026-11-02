import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { PayResponse } from "@/schemas/payment.schema";

export async function payPayment(paymentId: string): Promise<PayResponse> {
  const { data } = await apiClient.post<PayResponse>(
    endpoints.payments.pay(paymentId),
  );
  return data;
}

const MOCK_CONFIRM_DELAY_MS = 1200;

/**
 * Mock of Stripe's PaymentSheet confirm with the PY5 clientSecret. Swap for
 * @stripe/stripe-react-native once Stripe mode and its webhook are built.
 */
export async function confirmCardPayment(_clientSecret: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_CONFIRM_DELAY_MS));
}
