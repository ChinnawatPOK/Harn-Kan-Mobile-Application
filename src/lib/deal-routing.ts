import type {
  DealDetail,
  DealRole,
  DealStatus,
  MyDeal,
  ParticipantStatus,
} from "@/schemas/deal.schema";

export type DealScreen =
  | "/deal/[id]"
  | "/deal/joiner"
  | "/deal/post-payment"
  | "/deal/completed"
  | "/deal/refund";

function screenFor(
  dealStatus: DealStatus,
  me: { role: DealRole; status: ParticipantStatus } | null,
): DealScreen {
  if (dealStatus === "COMPLETED") return "/deal/completed";
  if (dealStatus === "CANCELLED" || dealStatus === "EXPIRED") {
    return "/deal/refund";
  }
  if (me?.role === "HOST") return "/deal/[id]";
  if (me?.status === "HELD" || me?.status === "RECEIVED") {
    return "/deal/post-payment";
  }
  // Not joined, reserved, paying, or left (FAILED) and able to join again.
  return "/deal/joiner";
}

export function dealScreenFor(deal: DealDetail): DealScreen {
  return screenFor(deal.status, deal.me);
}

export function myDealScreenFor(deal: MyDeal): DealScreen {
  return screenFor(deal.dealStatus, {
    role: deal.myRole,
    status: deal.myStatus,
  });
}
