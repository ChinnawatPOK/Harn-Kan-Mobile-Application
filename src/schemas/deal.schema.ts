export type DealCategory = "FOOD" | "DRINK";

export type DealStatus =
  | "ACTIVE"
  | "LOCKED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type DealRole = "HOST" | "PARTICIPANT";

export type ParticipantStatus =
  | "HOST"
  | "RESERVED"
  | "PAYMENT_PENDING"
  | "HELD"
  | "RECEIVED"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type CreateDealRequest = {
  dealName: string;
  category: DealCategory;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  details?: string;
  totalPrice: number;
  targetSlots: number;
  expiresInMinutes: number;
};

export type DealParticipant = {
  slotNo: number;
  userId: string;
  name: string;
  role: DealRole;
  status: ParticipantStatus;
  reservedUntil: string | null;
};

export type DealActions = {
  canJoin: boolean;
  canPay: boolean;
  canLeave: boolean;
  canCancel: boolean;
  canConfirmReceipt: boolean;
};

export type DealMe = {
  role: DealRole;
  status: ParticipantStatus;
  paymentId: string | null;
  amountToPay: number;
  refundAmount: number;
  reservedUntil: string | null;
  actions: DealActions;
};

// DR4 response; DR2 also answers with this shape.
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
  me: DealMe | null;
  actionsIfNotJoined?: { canJoin: boolean };
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

export type NearbyDealsParams = {
  lat: number;
  lng: number;
  radius?: number;
  category?: DealCategory;
  q?: string;
  page?: number;
  size?: number;
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

export type MyDealsTab = "created" | "joined" | "history";

export type MyDealsParams = {
  tab: MyDealsTab;
  category?: DealCategory;
  role?: DealRole;
  page?: number;
  size?: number;
};

export type MyDeal = {
  id: string;
  dealName: string;
  category: DealCategory;
  dealStatus: DealStatus;
  myRole: DealRole;
  myStatus: ParticipantStatus;
  totalPrice: number;
  pricePerSlot: number;
  joinedSlots: number;
  targetSlots: number;
  readySlots: number;
  readyToOrder: boolean;
  expiresAt: string;
  createdAt: string;
};

export type JoinDealResponse = {
  paymentId: string;
  amountToPay: number;
  reservedUntil: string;
  deal: DealDetail;
};
