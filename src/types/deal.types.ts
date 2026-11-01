export type DealCategory = "FOOD" | "DRINK";
export type DealStatus =
  | "ACTIVE"
  | "LOCKED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";
export type DealRole = "HOST" | "PARTICIPANT";
export type DealParticipantStatus =
  | "HOST"
  | "RESERVED"
  | "PAYMENT_PENDING"
  | "HELD"
  | "RECEIVED"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PageParams = {
  page?: number;
  size?: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

export type NearbyDeal = {
  id: string;
  dealName: string;
  details: string | null;
  category: DealCategory;
  pricePerSlot: number;
  joinedSlots: number;
  targetSlots: number;
  expiresAt: string;
  distanceMeters: number;
  participantInitials: string[];
};

export type NearbyDealsResponse = PageResponse<NearbyDeal>;

export type NearbyDealsParams = PageParams & {
  lat: number;
  lng: number;
  radius?: number;
  category?: DealCategory;
  q?: string;
};

export type CreateDealInput = {
  dealName: string;
  category: DealCategory;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  details?: string;
  menuImageUrl?: string;
  totalPrice: number;
  targetSlots: number;
  expiresInMinutes: number;
};

export type DealParticipant = {
  slotNo: number;
  userId: string;
  name: string;
  role: DealRole;
  status: DealParticipantStatus;
  reservedUntil: string | null;
};

export type DealActions = {
  canJoin: boolean;
  canPay: boolean;
  canLeave: boolean;
  canCancel: boolean;
  canConfirmReceipt: boolean;
};

export type DealDetail = {
  id: string;
  dealName: string;
  details: string | null;
  category: DealCategory;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  menuImageUrl: string | null;
  totalPrice: number;
  pricePerSlot: number;
  targetSlots: number;
  joinedSlots: number;
  status: DealStatus;
  expiresAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  distanceMeters: number | null;
  participants: DealParticipant[];
  me: {
    role: DealRole;
    status: DealParticipantStatus;
    paymentId: string | null;
    amountToPay: number;
    refundAmount: number;
    reservedUntil: string | null;
    actions: DealActions;
  } | null;
  actionsIfNotJoined: {
    canJoin: boolean;
  };
};

export type DealDetailParams = {
  lat?: number;
  lng?: number;
};

export type JoinDealResponse = {
  paymentId: string;
  amountToPay: number;
  reservedUntil: string;
  deal: DealDetail;
};

export type MyDealsTab = "created" | "joined" | "history";

export type MyDealsParams = PageParams & {
  tab?: MyDealsTab;
  category?: DealCategory;
  role?: DealRole;
};

export type MyDeal = {
  id: string;
  dealName: string;
  category: DealCategory;
  dealStatus: DealStatus;
  myRole: DealRole;
  myStatus: DealParticipantStatus;
  totalPrice: number;
  pricePerSlot: number;
  joinedSlots: number;
  targetSlots: number;
  readySlots: number;
  readyToOrder: boolean;
  expiresAt: string;
  createdAt: string;
};

export type DealReceipt = {
  receiptNo: string;
  dealId: string;
  dealName: string;
  category: DealCategory;
  completedAt: string;
  totalPrice: number;
  pricePerSlot: number;
  role: DealRole;
  amount: number;
  paymentId: string | null;
  payoutToHost: number;
  lines: {
    name: string;
    role: DealRole;
    amount: number;
  }[];
};
