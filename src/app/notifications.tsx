import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { getErrorMessage } from "@/api/errors";
import { useResolveDealScreen } from "@/hooks/useDeals";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import type { Notification } from "@/schemas/notification.schema";
import { useAuthStore } from "@/stores/auth.store";
import { formatRelativeTime } from "@/utils/format";

// The service's own `message` mixes English and Thai, so build the copy here
// and fall back to it only when `type` is missing.
function notificationCopy(notification: Notification) {
  const category = notification.category === "FOOD" ? "food" : "drink";
  switch (notification.type) {
    case "DEAL_CREATED":
      return {
        title: `New ${category} deal`,
        message: notification.shopName,
      };
    case "DEAL_CANCELLED":
      return {
        title: "Deal canceled",
        message: `${notification.shopName} was canceled. Your refund is in progress.`,
      };
    case "DEAL_EXPIRED":
      return {
        title: "Deal expired",
        message: `${notification.shopName} ran out of time. Your refund is in progress.`,
      };
    default:
      return { title: notification.shopName, message: notification.message };
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const resolveDealScreen = useResolveDealScreen();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const isOpening = useRef(false);
  const items = notifications.data?.items ?? [];

  // The notification type only says what the deal was (a "new deal" may have
  // expired since), so pick the screen from the deal's current state. This is
  // the deal screen's own load (it opens from cache), so a tap costs one call.
  // No press-in prefetch: it also fires when a scroll starts on a row.
  const openNotification = async (notification: Notification) => {
    if (isOpening.current) return;
    isOpening.current = true;
    setOpeningId(notification.id);
    if (!notification.read) markRead.mutate(notification.id);
    try {
      const pathname = await resolveDealScreen(notification.dealId);
      router.push({ pathname, params: { id: notification.dealId } });
    } finally {
      isOpening.current = false;
      setOpeningId(null);
    }
  };

  const emptyState = !accessToken ? (
    <Text style={styles.stateMessage}>Please log in to see notifications.</Text>
  ) : notifications.isPending ? (
    <ActivityIndicator
      accessibilityLabel="Loading notifications"
      color="#db2777"
    />
  ) : notifications.isError ? (
    <>
      <Text accessibilityRole="alert" style={styles.stateMessage}>
        {getErrorMessage(
          notifications.error,
          "Unable to load notifications. Please try again.",
        )}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void notifications.refetch()}
        style={styles.retryButton}
      >
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </>
  ) : (
    <>
      <Text style={styles.stateTitle}>No notifications yet</Text>
      <Text style={styles.stateMessage}>
        New deals in the categories you follow will show up here.
      </Text>
    </>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Svg
            fill="none"
            height={22}
            stroke="#334155"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            width={22}
          >
            <Path d="m15 18-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        contentContainerStyle={[
          styles.scrollContent,
          items.length === 0 && styles.scrollContentEmpty,
        ]}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<View style={styles.stateBox}>{emptyState}</View>}
        refreshControl={
          <RefreshControl
            onRefresh={() => void notifications.refetch()}
            refreshing={notifications.isRefetching && !notifications.isPending}
            tintColor="#db2777"
          />
        }
        renderItem={({ item }) => {
          const copy = notificationCopy(item);
          return (
            <Pressable
              accessibilityHint="Opens the deal"
              accessibilityLabel={`${item.read ? "" : "Unread. "}${copy.title}. ${copy.message}`}
              accessibilityRole="button"
              onPress={() => void openNotification(item)}
              style={({ pressed }) => [
                styles.notificationCard,
                pressed && styles.notificationCardPressed,
              ]}
            >
              <View
                style={[
                  styles.readIndicator,
                  item.read && styles.readIndicatorHidden,
                ]}
              />
              <View style={styles.notificationCopy}>
                <View style={styles.notificationHeading}>
                  <Text style={styles.notificationTitle}>{copy.title}</Text>
                  {openingId === item.id ? (
                    <ActivityIndicator
                      accessibilityLabel="Opening deal"
                      color="#db2777"
                      size="small"
                    />
                  ) : (
                    <Text style={styles.notificationTime}>
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                  )}
                </View>
                <Text style={styles.notificationMessage}>{copy.message}</Text>
              </View>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  scrollContentEmpty: {
    flexGrow: 1,
  },
  stateBox: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    padding: 24,
  },
  stateTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  stateMessage: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#db2777",
    borderRadius: 16,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#fdf2f8",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  title: {
    color: "#0f172a",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 16,
  },
  headerSpacer: {
    width: 40,
  },
  notificationCard: {
    alignItems: "flex-start",
    borderBottomColor: "#f1f5f9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 18,
  },
  notificationCardPressed: {
    backgroundColor: "#fff7fb",
  },
  readIndicator: {
    backgroundColor: "#db2777",
    borderRadius: 4,
    height: 8,
    marginTop: 5,
    width: 8,
  },
  readIndicatorHidden: {
    opacity: 0,
  },
  notificationCopy: {
    flex: 1,
    gap: 5,
  },
  notificationHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  notificationTitle: {
    color: "#0f172a",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  notificationTime: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
    paddingTop: 2,
  },
  notificationMessage: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
});
