import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { dealQueryKey, dealsQueryKey, useResolveDealScreen } from "@/hooks/useDeals";
import {
  notificationsQueryKey,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import { useSimulatorPushBanner } from "@/hooks/useSimulatorPushBanner";
import {
  handlePushTokenChange,
  pushDataOf,
  syncPushDevice,
} from "@/lib/push-notifications";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Push for the signed-in user: registers the device, refreshes the inbox when
 * a push arrives, and opens the deal when one is tapped. Mount it once, in a
 * layout that only renders after login.
 */
export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const markRead = useMarkNotificationRead();
  const resolveDealScreen = useResolveDealScreen();
  useSimulatorPushBanner();

  // Register on every start after login, and again if the token rolls.
  useEffect(() => {
    if (!accessToken) return;
    void syncPushDevice(accessToken);
    const subscription =
      Notifications.addPushTokenListener(handlePushTokenChange);
    return () => subscription.remove();
  }, [accessToken]);

  // A push means the inbox changed, and so did that deal (cancelled/expired).
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { dealId } = pushDataOf(notification);
        void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
        if (dealId) {
          void queryClient.invalidateQueries({ queryKey: dealQueryKey(dealId) });
          void queryClient.invalidateQueries({ queryKey: dealsQueryKey });
        }
      },
    );
    return () => subscription.remove();
  }, [queryClient]);

  // Covers both a tap while running and the tap that cold-started the app.
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);
  useEffect(() => {
    if (!lastResponse || !accessToken) return;
    if (
      lastResponse.actionIdentifier !==
      Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      return;
    }
    const id = lastResponse.notification.request.identifier;
    if (handledId.current === id) return;
    handledId.current = id;
    void Notifications.clearLastNotificationResponseAsync();

    const { dealId, notificationId } = pushDataOf(lastResponse.notification);
    if (notificationId) markRead.mutate(notificationId);
    if (!dealId) return;
    // The deal changed since the push was sent, so load it fresh and open
    // the screen for its current state (same as a tap in the inbox).
    void queryClient
      .invalidateQueries({ queryKey: dealQueryKey(dealId), refetchType: "none" })
      .then(() => resolveDealScreen(dealId))
      .then((pathname) => router.push({ pathname, params: { id: dealId } }));
  }, [accessToken, lastResponse, markRead, queryClient, resolveDealScreen, router]);
}
