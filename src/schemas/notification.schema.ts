export type NotificationCategory = "FOOD" | "DRINK";

export type NotificationPreferences = {
  categories: NotificationCategory[];
  userId?: string;
  updatedAt?: string;
};

export type Notification = {
  id: string;
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
