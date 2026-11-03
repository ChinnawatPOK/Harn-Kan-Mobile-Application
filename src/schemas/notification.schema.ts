export type NotificationCategory = "FOOD" | "DRINK";

export type NotificationPreferences = {
  categories: NotificationCategory[];
  userId?: string;
  updatedAt?: string;
};

export type NotificationType =
  | "DEAL_CREATED"
  | "DEAL_CANCELLED"
  | "DEAL_EXPIRED";

export type Notification = {
  id: string;
  type?: NotificationType;
  eventId: string;
  userId: string;
  dealId: string;
  category: NotificationCategory;
  shopName: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationList = {
  unreadCount: number;
  items: Notification[];
};
