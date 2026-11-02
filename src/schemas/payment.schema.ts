export type PaymentStatus =
  | "RESERVED"
  | "PAYMENT_PENDING"
  | "HELD"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "PAYOUT_PENDING"
  | "RELEASED";

export type PayResponse = {
  paymentId: string;
  status: PaymentStatus;
  clientSecret: string;
};
