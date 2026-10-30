import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/notification.service";
import { useAuthStore } from "@/stores/auth.store";

export const notificationPreferencesQueryKey = [
  "notification-preferences",
] as const;

export function useNotificationPreferences() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: notificationPreferencesQueryKey,
    queryFn: getNotificationPreferences,
    enabled: Boolean(accessToken),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationPreferencesQueryKey, preferences);
    },
  });
}
