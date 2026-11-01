import type { DealParticipantStatus } from "@/types/deal.types";

export type PaymentStatus =
  | Exclude<DealParticipantStatus, "HOST" | "RECEIVED">
  | "PAYOUT_PENDING"
  | "RELEASED";

export type Payment = {
  paymentId: string;
  dealId: string;
  participantId: string;
  amount: string;
  status: PaymentStatus;
  reservedUntil: string | null;
  confirmedReceipt: boolean;
};

export type StartPaymentResult = {
  paymentId: string;
  status: "PAYMENT_PENDING";
  clientSecret: string;
};
