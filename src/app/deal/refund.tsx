import { BrandMark } from "@/components/brand-mark";
import {
  Redirect,
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { getErrorMessage } from "@/api/errors";
import { DealDetailSkeleton } from "@/components/deal-detail-skeleton";
import { useDeal } from "@/hooks/useDeals";
import { useProfile } from "@/hooks/useProfile";
import { dealScreenFor } from "@/lib/deal-routing";
import type { DealParticipant } from "@/schemas/deal.schema";
import { formatBaht, formatDealDate } from "@/utils/format";

function initialsOf(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
  return letters.slice(0, 2).toUpperCase() || "?";
}

function refundStatusOf(participant: DealParticipant) {
  switch (participant.status) {
    case "REFUND_PENDING":
      return "Refunding";
    case "REFUNDED":
      return "Refunded";
    case "FAILED":
      return "Not charged";
    default:
      return "";
  }
}

export default function RefundDealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealId = firstParam(id);
  const dealQuery = useDeal(dealId);
  const profile = useProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const goToHistory = () =>
    router.canGoBack()
      ? router.back()
      : router.replace("/(tabs)/my-deals" as Href);

  const deal = dealQuery.data;

  if (!deal && !dealQuery.isError) {
    return <DealDetailSkeleton onBack={() => router.back()} />;
  }

  if (!deal) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.stateTitle}>Could not load this deal</Text>
          <Text style={styles.stateMessage}>
            {getErrorMessage(
              dealQuery.error,
              "Something went wrong. Please try again.",
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void dealQuery.refetch()}
            style={[styles.supportButton, styles.stateButton]}
          >
            <Text style={styles.supportButtonText}>Try again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={goToHistory}
            style={styles.historyButton}
          >
            <Text style={styles.historyButtonText}>Back to History</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Only cancelled and expired deals belong on this screen.
  const screen = dealScreenFor(deal);
  if (screen !== "/deal/refund") {
    return <Redirect href={{ pathname: screen, params: { id: deal.id } }} />;
  }

  const me = deal.me;
  const isHost = me?.role === "HOST";
  const isExpired = deal.status === "EXPIRED";
  const myUserId = profile.data?.id;
  const refundAmount = me?.refundAmount ?? 0;
  const isRefunding = deal.participants.some(
    (participant) => participant.status === "REFUND_PENDING",
  );
  const myRefundDone = me?.status === "REFUNDED";

  const bannerTitle = `${isExpired ? "Deal Expired" : "Deal Canceled"} - ${
    isRefunding ? "Refund in Progress" : "Refund Complete"
  }`;
  const bannerDescription = isHost
    ? isRefunding
      ? "Participants who paid are being refunded."
      : "Everyone who paid has been refunded."
    : me?.status === "REFUND_PENDING"
      ? "Your payment is protected and being returned."
      : myRefundDone
        ? "Your payment has been returned."
        : "You were not charged for this deal.";

  const closedAt = isExpired
    ? deal.expiresAt
    : (deal.cancelledAt ?? deal.expiresAt);
  const closedLabel = isExpired ? "Expired" : "Canceled by the host";

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await dealQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#db2777"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to deal history"
            accessibilityRole="button"
            onPress={goToHistory}
            style={styles.backButton}
          >
            <Icon color="#be185d" name="back" size={20} />
          </Pressable>
          <View pointerEvents="none" style={styles.brandMark}>
            <BrandMark compact />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.warningBanner}>
            <View style={styles.warningIcon}>
              <Icon color="#fff" name="warning" size={23} />
            </View>
            <View style={styles.warningCopy}>
              <Text style={styles.warningTitle}>{bannerTitle}</Text>
              <Text style={styles.warningDescription}>{bannerDescription}</Text>
            </View>
          </View>

          <View style={styles.dealCard}>
            <DealVisual compact />
            <View style={styles.dealInfo}>
              <Text style={styles.category}>
                {deal.category === "FOOD" ? "Food" : "Drink"}
              </Text>
              <Text numberOfLines={1} style={styles.dealName}>
                {deal.dealName}
              </Text>
              <Text numberOfLines={1} style={styles.dealSubtitle}>
                {closedLabel} · {formatDealDate(closedAt)}
              </Text>
              <Text style={styles.dealPrice}>
                {formatBaht(deal.totalPrice)} total
              </Text>
            </View>
          </View>

          {refundAmount > 0 ? (
            <View style={styles.refundAmount}>
              <Text style={styles.refundLabel}>Refund Amount</Text>
              <Text style={styles.refundValue}>{formatBaht(refundAmount)}</Text>
              <View style={styles.refundNote}>
                <Icon color="#9d174d" name="clock" size={16} />
                <Text style={styles.refundNoteText}>
                  {myRefundDone
                    ? "Refunded to your original payment method"
                    : "Refunding to original payment method (within 3-5 days)"}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.participantsSection}>
            <View style={styles.participantsHeading}>
              <Text style={styles.participantsTitle}>Participants</Text>
              <Text style={styles.participantsCount}>
                {deal.participants.length} participants
              </Text>
            </View>
            <View style={styles.participantsCard}>
              {deal.participants.map((participant, index) => {
                const isCurrent =
                  Boolean(myUserId) && participant.userId === myUserId;
                const refundStatus = refundStatusOf(participant);
                return (
                  <View
                    key={participant.slotNo}
                    style={[
                      styles.participantRow,
                      index < deal.participants.length - 1 &&
                        styles.participantRowBorder,
                    ]}
                  >
                    <Avatar
                      current={isCurrent}
                      label={initialsOf(participant.name)}
                    />
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {isCurrent ? "You" : participant.name}
                      </Text>
                      <Text style={styles.participantDetail}>
                        {participant.role === "HOST" ? "Host" : "Participant"}
                      </Text>
                    </View>
                    {refundStatus ? (
                      <Text
                        style={[
                          styles.refundStatus,
                          refundStatus === "Refunding"
                            ? styles.refundingStatus
                            : styles.refundedStatus,
                        ]}
                      >
                        {refundStatus}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={goToHistory}
            style={styles.historyButton}
          >
            <Text style={styles.historyButtonText}>Back to History</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function DealVisual({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.dealVisual, compact && styles.dealVisualCompact]}>
      <View
        pointerEvents="none"
        style={[
          styles.visualCircleLarge,
          compact && styles.visualCircleLargeCompact,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.visualCircleSmall,
          compact && styles.visualCircleSmallCompact,
        ]}
      />
      <View style={[styles.visualPlate, compact && styles.visualPlateCompact]}>
        <View style={[styles.visualFood, compact && styles.visualFoodCompact]}>
          <View style={styles.foodTop} />
          <View style={[styles.foodLine, styles.foodLineFirst]} />
          <View style={[styles.foodLine, styles.foodLineSecond]} />
        </View>
      </View>
    </View>
  );
}

function Avatar({ label, current }: { label: string; current: boolean }) {
  return (
    <View style={[styles.avatar, current && styles.avatarCurrent]}>
      <Text style={styles.avatarLabel}>{label}</Text>
    </View>
  );
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name: "back" | "clock" | "warning";
  size: number;
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
    >
      {name === "back" ? <Path d="m15 18-6-6 6-6" /> : null}
      {name === "clock" ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === "warning" ? (
        <>
          <Path d="M10.3 4.4 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
          <Path d="M12 9v4M12 17h.01" />
        </>
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 80,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#fdf2f8",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandMark: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  headerSpacer: {
    height: 40,
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  warningBanner: {
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderColor: "#ffedd5",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  warningIcon: {
    alignItems: "center",
    backgroundColor: "#f97316",
    borderRadius: 999,
    elevation: 4,
    height: 48,
    justifyContent: "center",
    shadowColor: "#fed7aa",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    width: 48,
  },
  warningCopy: {
    flex: 1,
  },
  warningTitle: {
    color: "#7c2d12",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  warningDescription: {
    color: "#c2410c",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  dealCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#fce7f3",
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    padding: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  dealVisual: {
    alignItems: "center",
    backgroundColor: "#fdf2f8",
    height: 208,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  dealVisualCompact: {
    borderRadius: 16,
    height: 96,
    width: 96,
  },
  visualCircleLarge: {
    backgroundColor: "rgba(249, 168, 212, 0.7)",
    borderRadius: 999,
    height: 112,
    position: "absolute",
    right: -32,
    top: 16,
    width: 112,
  },
  visualCircleLargeCompact: {
    height: 56,
    right: -16,
    top: 8,
    width: 56,
  },
  visualCircleSmall: {
    backgroundColor: "#fbcfe8",
    borderRadius: 999,
    bottom: 12,
    height: 80,
    left: 16,
    position: "absolute",
    width: 80,
  },
  visualCircleSmallCompact: {
    bottom: 0,
    height: 40,
    left: -12,
    width: 40,
  },
  visualPlate: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 64,
    elevation: 8,
    height: 128,
    justifyContent: "center",
    shadowColor: "#9d174d",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    width: 128,
  },
  visualPlateCompact: {
    height: 64,
    width: 64,
  },
  visualFood: {
    backgroundColor: "#ec4899",
    borderColor: "#fdf2f8",
    borderRadius: 44,
    borderWidth: 6,
    height: 80,
    overflow: "hidden",
    width: 80,
  },
  visualFoodCompact: {
    borderRadius: 22,
    height: 40,
    width: 40,
  },
  foodTop: {
    backgroundColor: "rgba(249, 168, 212, 0.7)",
    height: "50%",
  },
  foodLine: {
    backgroundColor: "#be185d",
    borderRadius: 99,
    height: 6,
    marginTop: 4,
  },
  foodLineFirst: {
    marginHorizontal: 6,
  },
  foodLineSecond: {
    backgroundColor: "#f9a8d4",
    marginHorizontal: 10,
  },
  dealInfo: {
    flex: 1,
    minWidth: 0,
  },
  category: {
    alignSelf: "flex-start",
    backgroundColor: "#fce7f3",
    borderRadius: 999,
    color: "#be185d",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  dealName: {
    color: "#020617",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 8,
  },
  dealSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  dealPrice: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },
  refundAmount: {
    backgroundColor: "#fdf2f8",
    borderColor: "#fce7f3",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
  },
  refundLabel: {
    color: "#ec4899",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  refundValue: {
    color: "#be185d",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  refundNote: {
    alignItems: "flex-start",
    borderColor: "#fce7f3",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
  },
  refundNoteText: {
    color: "#9d174d",
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 20,
  },
  participantsSection: {
    marginTop: 24,
  },
  participantsHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  participantsTitle: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "800",
  },
  participantsCount: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  participantsCard: {
    backgroundColor: "#fff",
    borderColor: "#f1f5f9",
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  participantRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  participantRowBorder: {
    borderBottomColor: "#f1f5f9",
    borderBottomWidth: 1,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#fce7f3",
    borderColor: "#fff",
    borderRadius: 999,
    borderWidth: 2,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarCurrent: {
    backgroundColor: "#fbcfe8",
  },
  avatarLabel: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "800",
  },
  participantInfo: {
    flex: 1,
    minWidth: 0,
  },
  participantName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  participantDetail: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  refundStatus: {
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refundedStatus: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
  },
  refundingStatus: {
    backgroundColor: "#fff7ed",
    color: "#c2410c",
  },
  supportButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#fbcfe8",
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 24,
    paddingVertical: 13,
  },
  supportButtonText: {
    color: "#be185d",
    fontSize: 14,
    fontWeight: "800",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: "#020617",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  stateMessage: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  stateButton: {
    alignSelf: "stretch",
  },
  historyButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  historyButtonText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
  },
});
