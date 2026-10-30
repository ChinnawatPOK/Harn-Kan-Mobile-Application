import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  NotificationCategory,
  NotificationPreferences,
} from "@/schemas/notification.schema";

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>(
    endpoints.notifications.preferences,
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
