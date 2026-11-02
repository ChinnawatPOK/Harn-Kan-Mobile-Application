import type { DealDetail } from "@/schemas/deal.schema";

export type DealScreen =
  | "/deal/[id]"
  | "/deal/joiner"
  | "/deal/post-payment"
  | "/deal/completed"
  | "/deal/refund";

/** Which deal screen the current viewer should see for this deal. */
export function dealScreenFor(deal: DealDetail): DealScreen {
  if (deal.status === "COMPLETED") return "/deal/completed";
  if (deal.status === "CANCELLED" || deal.status === "EXPIRED") {
    return "/deal/refund";
  }
  if (deal.me?.role === "HOST") return "/deal/[id]";
  if (deal.me?.status === "HELD" || deal.me?.status === "RECEIVED") {
    return "/deal/post-payment";
  }
  // Not joined, reserved, paying, or left (FAILED) and able to join again.
  return "/deal/joiner";
}
