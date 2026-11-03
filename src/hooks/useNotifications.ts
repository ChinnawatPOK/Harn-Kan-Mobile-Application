import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useRef } from "react";

import type { NotificationList } from "@/schemas/notification.schema";
import {
  getNotifications,
  markNotificationRead,
} from "@/services/notification.service";
import { useAuthStore } from "@/stores/auth.store";

export const notificationsQueryKey = ["notifications"] as const;

const NOTIFICATIONS_STALE_TIME_MS = 60_000;

function useNotificationsQuery<T = NotificationList>(
  select?: (data: NotificationList) => T,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    enabled: Boolean(accessToken),
    select,
    staleTime: NOTIFICATIONS_STALE_TIME_MS,
    refetchOnWindowFocus: isFocused,
  });

  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      if (accessToken) {
        void queryClient.refetchQueries({
          queryKey: notificationsQueryKey,
          stale: true,
          type: "active",
        });
      }
    }, [accessToken, queryClient]),
  );

  return query;
}

export function useNotifications() {
  return useNotificationsQuery();
}

const selectUnreadCount = (data: NotificationList) => data.unreadCount;

export function useUnreadNotificationCount() {
  return useNotificationsQuery(selectUnreadCount).data ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const previous = queryClient.getQueryData<NotificationList>(
        notificationsQueryKey,
      );
      if (previous) {
        queryClient.setQueryData<NotificationList>(notificationsQueryKey, {
          unreadCount: Math.max(
            0,
            previous.unreadCount -
              (previous.items.some(
                (item) => item.id === notificationId && !item.read,
              )
                ? 1
                : 0),
          ),
          items: previous.items.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        });
      }
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationsQueryKey, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}
