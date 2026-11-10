import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

import { notificationsQueryKey } from "@/hooks/useNotifications";
import { isPushlessSimulator } from "@/lib/push-notifications";
import type {
  NotificationType,
  PushNotificationData,
} from "@/schemas/notification.schema";
import { getNotifications } from "@/services/notification.service";
import { useAuthStore } from "@/stores/auth.store";

const POLL_INTERVAL_MS = 5_000;
const isDevSimulator = __DEV__ && isPushlessSimulator;

// Same titles the Notification Service puts on a real push.
const TITLES: Record<NotificationType, string> = {
  DEAL_CREATED: "ดีลใหม่",
  DEAL_CANCELLED: "ดีลถูกยกเลิก",
  DEAL_EXPIRED: "ดีลหมดเวลา",
};

/**
 * Dev only: simulators running our own build get no push token, so remote
 * pushes never reach them (Expo Go gets real ones and skips this).
 * Polls the inbox and shows each new item as a local notification, which goes
 * through the same banner and tap handling as a real push.
 */
export function useSimulatorPushBanner() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    enabled: isDevSimulator && Boolean(accessToken),
    refetchInterval: POLL_INTERVAL_MS,
  });

  // The first inbox loaded for a session is history, not new notifications.
  const seen = useRef<{ session: string; ids: Set<string> } | null>(null);
  useEffect(() => {
    if (!isDevSimulator || !data || !accessToken) return;
    const previous =
      seen.current?.session === accessToken ? seen.current.ids : null;
    if (previous) {
      for (const item of data.items) {
        if (previous.has(item.id) || item.read) continue;
        const pushData: PushNotificationData = {
          type: item.type,
          dealId: item.dealId,
          notificationId: item.id,
        };
        void Notifications.scheduleNotificationAsync({
          identifier: `inbox-${item.id}`,
          content: {
            title: item.type ? TITLES[item.type] : item.shopName,
            body: item.message,
            data: pushData,
          },
          trigger: null,
        });
      }
    }
    seen.current = {
      session: accessToken,
      ids: new Set(data.items.map((item) => item.id)),
    };
  }, [accessToken, data]);
}
