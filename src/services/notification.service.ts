import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  Notification,
  NotificationCategory,
  NotificationList,
  NotificationPreferences,
} from "@/schemas/notification.schema";

export async function getNotifications(): Promise<NotificationList> {
  const { data } = await apiClient.get<Notification[] | NotificationList>(
    endpoints.notifications.list,
  );
  if (Array.isArray(data)) {
    return {
      unreadCount: data.filter((item) => !item.read).length,
      items: data,
    };
  }
  return data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>(
    endpoints.notifications.preferences,
  );
  return data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<Notification> {
  const { data } = await apiClient.patch<Notification>(
    endpoints.notifications.markRead(notificationId),
  );
  return data;
}

export async function updateNotificationPreferences(
  categories: NotificationCategory[],
): Promise<NotificationPreferences> {
  const { data } = await apiClient.put<NotificationPreferences>(
    endpoints.notifications.preferences,
    { categories },
  );
  return data;
}
