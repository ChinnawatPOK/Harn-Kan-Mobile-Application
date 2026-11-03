import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { getErrorMessage } from "@/api/errors";
import { DealApiState } from "@/components/deal-api-state";
import { MockPaymentSheet } from "@/components/mock-payment-sheet";
import {
  useDeal,
  useJoinDeal,
  useLeaveDeal,
  usePayDeal,
} from "@/hooks/useDeals";
import { useNow } from "@/hooks/useNow";
import { useProfile } from "@/hooks/useProfile";
import { dealScreenFor } from "@/lib/deal-routing";
import type { DealParticipant } from "@/schemas/deal.schema";
import { confirmCardPayment } from "@/services/payment.service";
import { formatBaht } from "@/utils/format";

function initialsOf(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
  return letters.slice(0, 2).toUpperCase() || "?";
}

function secondsUntil(isoDate: string | null | undefined, now: number) {
  if (!isoDate) return 0;
  return Math.max(0, Math.floor((new Date(isoDate).getTime() - now) / 1000));
}

function participantDetail(participant: DealParticipant) {
  switch (participant.status) {
    case "HOST":
      return "Deal creator";
    case "HELD":
    case "RECEIVED":
      return "Payment complete";
    case "RESERVED":
    case "PAYMENT_PENDING":
      return "Waiting for payment";
    default:
      return "";
  }
}

export default function JoinerDealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealId = firstParam(id);
  const dealQuery = useDeal(dealId);
  const profile = useProfile();
  const joinDeal = useJoinDeal();
  const payDeal = usePayDeal();
  const leaveDeal = useLeaveDeal();
  const now = useNow();
  // One sheet for every step: confirm the join, pay, then the card sheet.
  const [sheet, setSheet] = useState<
    "confirmJoin" | "checkout" | "card" | null
  >(null);
  const [isConfirmingCard, setIsConfirmingCard] = useState(false);
  // From PY5; the card sheet confirms the payment with it.
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deal = dealQuery.data;

  if (!deal && !dealQuery.isError) {
    return <DealApiState isLoading message="Loading deal…" />;
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
            style={[styles.primaryButton, styles.retryButton]}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.leaveButton}
          >
            <Text style={styles.leaveButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Hosts, paid participants and closed deals have their own screens.
  const screen = dealScreenFor(deal);
  if (screen !== "/deal/joiner") {
    return <Redirect href={{ pathname: screen, params: { id: deal.id } }} />;
  }

  const me = deal.me;
  const isReserved = me?.status === "RESERVED";
  const isPaying = me?.status === "PAYMENT_PENDING";
  const hasSlot = isReserved || isPaying;
  const canJoin = me
    ? me.actions.canJoin
    : (deal.actionsIfNotJoined?.canJoin ?? false);
  const canPay = me?.actions.canPay ?? false;
  const canLeave = me?.actions.canLeave ?? false;
  const amountToPay = hasSlot && me ? me.amountToPay : deal.pricePerSlot;
  const paySeconds = secondsUntil(me?.reservedUntil, now);
  const reservationExpired =
    hasSlot && Boolean(me?.reservedUntil) && paySeconds === 0;
  const countdown = formatTime(paySeconds);

  const category = deal.category === "FOOD" ? "Food" : "Drink";
  const dealSeconds = secondsUntil(deal.expiresAt, now);
  const dealDuration = Math.max(
    1,
    (new Date(deal.expiresAt).getTime() - new Date(deal.createdAt).getTime()) /
      1000,
  );
  const dealExpiryProgress = Math.max(
    0,
    Math.min(100, (dealSeconds / dealDuration) * 100),
  );
  const openSlots = Math.max(0, deal.targetSlots - deal.participants.length);
  const myUserId = profile.data?.id;

  const isBusy = joinDeal.isPending || payDeal.isPending || leaveDeal.isPending;
  const actionError = joinDeal.error ?? payDeal.error ?? leaveDeal.error;

  const resetErrors = () => {
    joinDeal.reset();
    payDeal.reset();
    leaveDeal.reset();
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await dealQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const openJoinConfirmation = () => {
    resetErrors();
    setSheet("confirmJoin");
  };

  const closeSheet = () => {
    if (joinDeal.isPending || isConfirmingCard) return;
    setSheet(null);
  };

  const confirmJoin = () => {
    joinDeal.mutate(deal.id, {
      onSuccess: () => setSheet("checkout"),
      onError: () => setSheet(null),
    });
  };

  const payNow = () => {
    const paymentId = me?.paymentId;
    if (!paymentId) return;
    resetErrors();
    payDeal.mutate(
      { paymentId, dealId: deal.id },
      {
        onSuccess: (payment) => {
          setClientSecret(payment.clientSecret);
          setSheet("card");
        },
        onError: () => setSheet(null),
      },
    );
  };

  // The result arrives via the webhook, so the page polls until HELD.
  const payWithCard = async () => {
    if (!clientSecret) return;
    setIsConfirmingCard(true);
    try {
      await confirmCardPayment(clientSecret);
      setClientSecret(null);
      setSheet(null);
      void dealQuery.refetch();
    } finally {
      setIsConfirmingCard(false);
    }
  };

  const confirmLeave = () => {
    Alert.alert(
      "Leave this deal?",
      "Your slot will be released for someone else.",
      [
        { style: "cancel", text: "Stay" },
        {
          onPress: () => {
            resetErrors();
            leaveDeal.mutate(deal.id);
          },
          style: "destructive",
          text: "Leave Deal",
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
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
        <View style={styles.hero}>
          <DealVisual />
          <View style={styles.heroActions}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Icon color="#0f172a" name="back" size={20} />
            </Pressable>
            <View style={styles.joinStatus}>
              <Text style={styles.joinStatusText}>
                {isPaying ? "PAYING" : isReserved ? "RESERVED" : "JOINING"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.dealHeader}>
            <View style={styles.dealInfo}>
              <Text style={styles.categoryBadge}>{category}</Text>
              <Text style={styles.dealName}>{deal.dealName}</Text>
              <Text style={styles.dealDescription}>
                {deal.details || deal.pickupLocation}
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.totalPrice}>
                {formatBaht(deal.totalPrice)}
              </Text>
              <Text style={styles.totalPriceLabel}>TOTAL PRICE</Text>
            </View>
          </View>

          <View style={styles.timerCard}>
            <View style={styles.timerRow}>
              <View style={styles.timerIcon}>
                <Icon color="#fcd34d" name="clock" size={21} />
              </View>
              <View style={styles.timerInfo}>
                <Text style={styles.timerLabel}>DEAL EXPIRES IN</Text>
                <Text style={styles.timerValue}>{formatTime(dealSeconds)}</Text>
              </View>
              <Text style={styles.activeBadge}>
                {deal.status === "LOCKED" ? "Reserved" : "Active"}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressValue,
                  { width: `${dealExpiryProgress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.amountCard}>
            <View>
              <Text style={styles.amountLabel}>AMOUNT TO PAY</Text>
              <Text style={styles.amountValue}>{formatBaht(amountToPay)}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Icon color="#fff" name="wallet" size={22} />
            </View>
          </View>

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.sectionCount}>
                {deal.joinedSlots} of {deal.targetSlots} slots
              </Text>
            </View>
            <View style={styles.participantCard}>
              {deal.participants.map((participant, index) => {
                const isCurrent =
                  hasSlot &&
                  Boolean(myUserId) &&
                  participant.userId === myUserId;
                return (
                  <ParticipantRow
                    badge={
                      isCurrent
                        ? isPaying
                          ? "Processing"
                          : `Pay in ${countdown}`
                        : undefined
                    }
                    detail={isCurrent ? "" : participantDetail(participant)}
                    initials={initialsOf(participant.name)}
                    isCurrent={isCurrent}
                    isHost={participant.role === "HOST"}
                    key={participant.slotNo}
                    last={
                      openSlots === 0 && index === deal.participants.length - 1
                    }
                    name={isCurrent ? "You" : participant.name}
                  />
                );
              })}
              {Array.from({ length: openSlots }, (_, index) => (
                <ParticipantRow
                  detail="Available"
                  initials=""
                  isCurrent={false}
                  isHost={false}
                  key={`open-${index}`}
                  last={index === openSlots - 1}
                  name="Empty slot"
                />
              ))}
            </View>
          </View>

          {actionError ? (
            <Text accessibilityRole="alert" style={styles.actionError}>
              {getErrorMessage(
                actionError,
                "Something went wrong. Please try again.",
              )}
            </Text>
          ) : null}

          {hasSlot ? (
            <>
              {isPaying && clientSecret ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSheet("card")}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Icon color="#fff" name="card" size={18} />
                  <Text style={styles.primaryButtonText}>Continue payment</Text>
                </Pressable>
              ) : isPaying ? (
                <View style={styles.processingNote}>
                  <ActivityIndicator color="#b45309" size="small" />
                  <Text style={styles.processingText}>
                    Payment processing. This page updates once it is confirmed.
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    busy: payDeal.isPending,
                    disabled: !canPay || reservationExpired || isBusy,
                  }}
                  disabled={!canPay || reservationExpired || isBusy}
                  onPress={payNow}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (!canPay || reservationExpired || isBusy) &&
                      styles.primaryButtonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Icon color="#fff" name="card" size={18} />
                  <Text style={styles.primaryButtonText}>
                    {payDeal.isPending
                      ? "Paying…"
                      : reservationExpired
                        ? "Reservation expired"
                        : "Pay Now"}
                  </Text>
                </Pressable>
              )}
              {canLeave ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={confirmLeave}
                  style={styles.leaveButton}
                >
                  <Text style={styles.leaveButtonText}>
                    {leaveDeal.isPending ? "Leaving…" : "Leave Deal"}
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: joinDeal.isPending,
                disabled: !canJoin || isBusy,
              }}
              disabled={!canJoin || isBusy}
              onPress={openJoinConfirmation}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canJoin || isBusy) && styles.primaryButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Icon color="#fff" name="people" size={18} />
              <Text style={styles.primaryButtonText}>
                {canJoin
                  ? "Join Deal"
                  : openSlots === 0
                    ? "Deal is full"
                    : "Not available"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={closeSheet}
        transparent
        visible={
          sheet === "confirmJoin" ||
          (sheet === "checkout" && isReserved) ||
          (sheet === "card" && Boolean(clientSecret))
        }
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            onPress={closeSheet}
            style={styles.modalBackdrop}
          />
          {sheet === "card" ? (
            <MockPaymentSheet
              amount={amountToPay}
              isProcessing={isConfirmingCard}
              onCancel={closeSheet}
              onPay={() => void payWithCard()}
            />
          ) : sheet === "confirmJoin" ? (
            <View style={styles.checkoutCard}>
              <View style={styles.checkoutHandle} />
              <View style={styles.checkoutWalletIcon}>
                <Icon color="#db2777" name="people" size={25} />
              </View>
              <Text style={styles.checkoutAmountLabel}>JOIN THIS DEAL?</Text>
              <Text style={styles.checkoutAmount}>
                {formatBaht(amountToPay)}
              </Text>
              <Text style={styles.checkoutDescription}>
                Joining reserves your slot in {deal.dealName}. You pay your
                share on the next step.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  busy: joinDeal.isPending,
                  disabled: joinDeal.isPending,
                }}
                disabled={joinDeal.isPending}
                onPress={confirmJoin}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.checkoutPayButton,
                  joinDeal.isPending && styles.primaryButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Icon color="#fff" name="people" size={18} />
                <Text style={styles.primaryButtonText}>
                  {joinDeal.isPending ? "Joining…" : "Confirm & Join"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={joinDeal.isPending}
                onPress={closeSheet}
                style={styles.checkoutCancelButton}
              >
                <Text style={styles.checkoutCancelText}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.checkoutCard}>
              <View style={styles.checkoutHandle} />
              <View style={styles.checkoutWalletIcon}>
                <Icon color="#db2777" name="wallet" size={25} />
              </View>
              <Text style={styles.checkoutAmountLabel}>AMOUNT TO PAY</Text>
              <Text style={styles.checkoutAmount}>
                {formatBaht(amountToPay)}
              </Text>
              <Text style={styles.checkoutDescription}>
                Your exact share of the {formatBaht(deal.totalPrice)} total
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={!canPay || reservationExpired || isBusy}
                onPress={payNow}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.checkoutPayButton,
                  (!canPay || reservationExpired || isBusy) &&
                    styles.primaryButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Icon color="#fff" name="card" size={18} />
                <Text style={styles.primaryButtonText}>
                  {payDeal.isPending ? "Paying…" : "Pay Now"}
                </Text>
                <Text style={styles.checkoutCountdown}>{countdown}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={closeSheet}
                style={styles.checkoutCancelButton}
              >
                <Text style={styles.checkoutCancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${minutes}:${remainingSeconds}`
    : `${minutes}:${remainingSeconds}`;
}

function ParticipantRow({
  detail,
  initials,
  isCurrent,
  isHost,
  last,
  name,
  badge,
}: {
  detail: string;
  initials: string;
  isCurrent: boolean;
  isHost: boolean;
  last: boolean;
  name: string;
  badge?: string;
}) {
  const isEmpty = !initials;
  return (
    <View style={[styles.participantRow, !last && styles.participantRowBorder]}>
      {isEmpty ? (
        <View style={styles.emptyAvatar}>
          <Icon color="#cbd5e1" name="people" size={16} />
        </View>
      ) : (
        <View
          style={[
            styles.participantAvatar,
            isCurrent && styles.currentParticipantAvatar,
          ]}
        >
          <Text style={styles.participantInitials}>{initials}</Text>
        </View>
      )}
      <View style={styles.participantInfo}>
        <Text
          style={[
            styles.participantName,
            isEmpty && styles.emptyParticipantName,
          ]}
        >
          {name}
        </Text>
        {detail ? <Text style={styles.participantDetail}>{detail}</Text> : null}
      </View>
      {isHost ? (
        <View style={styles.hostBadge}>
          <Text style={styles.hostBadgeText}>Host</Text>
        </View>
      ) : null}
      {badge ? (
        <View style={styles.paymentBadge}>
          <Icon color="#b45309" name="clock" size={11} />
          <Text style={styles.paymentBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function DealVisual() {
  return (
    <View style={styles.dealVisual}>
      <View style={styles.visualCircleLarge} />
      <View style={styles.visualCircleSmall} />
      <View style={styles.visualPlate}>
        <View style={styles.visualFood}>
          <View style={styles.foodTop} />
          <View style={styles.foodLine} />
          <View style={styles.foodLineShort} />
        </View>
      </View>
      <View style={styles.pickupBadge}>
        <View style={styles.pickupDot} />
        <Text style={styles.pickupBadgeText}>Pickup nearby</Text>
      </View>
    </View>
  );
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name: "back" | "card" | "clock" | "people" | "wallet";
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
      {name === "card" ? (
        <>
          <Rect height="14" rx="2" width="18" x="3" y="5" />
          <Path d="M3 10h18M7 15h3" />
        </>
      ) : null}
      {name === "clock" ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === "people" ? (
        <>
          <Circle cx="9" cy="8" r="3" />
          <Path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
        </>
      ) : null}
      {name === "wallet" ? (
        <>
          <Path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
          <Path d="M15 11h7v5h-7a2.5 2.5 0 0 1 0-5Z" />
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
    paddingBottom: 32,
  },
  hero: {
    height: 208,
    position: "relative",
  },
  dealVisual: {
    alignItems: "center",
    backgroundColor: "#fce7f3",
    height: "100%",
    justifyContent: "center",
    overflow: "hidden",
  },
  visualCircleLarge: {
    backgroundColor: "rgba(244, 114, 182, 0.65)",
    borderRadius: 999,
    height: 112,
    position: "absolute",
    right: -32,
    top: 16,
    width: 112,
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
  visualPlate: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 64,
    elevation: 10,
    height: 128,
    justifyContent: "center",
    shadowColor: "#9d174d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: 128,
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
  foodTop: {
    backgroundColor: "rgba(251, 207, 232, 0.8)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: "50%",
    width: "100%",
  },
  foodLine: {
    alignSelf: "center",
    backgroundColor: "#be185d",
    borderRadius: 6,
    height: 6,
    marginTop: 4,
    width: "66%",
  },
  foodLineShort: {
    alignSelf: "center",
    backgroundColor: "#f9a8d4",
    borderRadius: 6,
    height: 6,
    marginTop: 4,
    width: "50%",
  },
  heroActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 20,
    position: "absolute",
    right: 20,
    top: 8,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 40,
  },
  joinStatus: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 999,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  joinStatusText: {
    color: "#be185d",
    fontSize: 10,
    fontWeight: "800",
  },
  pickupBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 999,
    bottom: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: "absolute",
    right: 20,
  },
  pickupDot: {
    backgroundColor: "#10b981",
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  pickupBadgeText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    position: "relative",
  },
  dealHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  dealInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fce7f3",
    borderRadius: 999,
    color: "#be185d",
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  dealName: {
    color: "#020617",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 10,
  },
  dealDescription: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  priceInfo: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  totalPrice: {
    color: "#020617",
    fontSize: 22,
    fontWeight: "800",
  },
  totalPriceLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  timerCard: {
    backgroundColor: "#020617",
    borderRadius: 24,
    elevation: 10,
    marginTop: 18,
    overflow: "hidden",
    shadowColor: "#cbd5e1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  timerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  timerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(252, 211, 77, 0.15)",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  timerInfo: {
    flex: 1,
  },
  timerLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  timerValue: {
    color: "#fcd34d",
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 999,
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    height: 6,
  },
  progressValue: {
    backgroundColor: "#fcd34d",
    borderBottomRightRadius: 4,
    borderTopRightRadius: 4,
    height: "100%",
  },
  amountCard: {
    alignItems: "center",
    backgroundColor: "#fdf2f8",
    borderColor: "#fce7f3",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 16,
    padding: 20,
  },
  amountLabel: {
    color: "#ec4899",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  amountValue: {
    color: "#be185d",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  walletIcon: {
    alignItems: "center",
    backgroundColor: "#db2777",
    borderRadius: 24,
    elevation: 4,
    height: 48,
    justifyContent: "center",
    shadowColor: "#fbcfe8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: 48,
  },
  participantsSection: {
    marginTop: 4,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "800",
  },
  sectionCount: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  participantCard: {
    backgroundColor: "#fff",
    borderColor: "#f1f5f9",
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  participantRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  participantRowBorder: {
    borderBottomColor: "#f1f5f9",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  participantAvatar: {
    alignItems: "center",
    backgroundColor: "#fce7f3",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  currentParticipantAvatar: {
    backgroundColor: "#fbcfe8",
  },
  participantInitials: {
    color: "#9d174d",
    fontSize: 9,
    fontWeight: "800",
  },
  emptyAvatar: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  participantInfo: {
    flex: 1,
    minWidth: 0,
  },
  participantName: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyParticipantName: {
    color: "#94a3b8",
  },
  participantDetail: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  hostBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hostBadgeText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
  },
  paymentBadge: {
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  paymentBadgeText: {
    color: "#b45309",
    fontSize: 9,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#db2777",
    borderRadius: 16,
    elevation: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 16,
    shadowColor: "#fbcfe8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  centered: {
    alignItems: "center",
    flex: 1,
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
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "stretch",
    marginTop: 18,
  },
  actionError: {
    color: "#be185d",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  processingNote: {
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  processingText: {
    color: "#b45309",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  leaveButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  leaveButtonText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  checkoutCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  checkoutHandle: {
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    height: 5,
    marginBottom: 20,
    width: 40,
  },
  checkoutWalletIcon: {
    alignItems: "center",
    backgroundColor: "#fce7f3",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  checkoutAmountLabel: {
    color: "#ec4899",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 18,
  },
  checkoutAmount: {
    color: "#020617",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 4,
  },
  checkoutDescription: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  checkoutPayButton: {
    marginTop: 24,
    width: "100%",
  },
  checkoutCountdown: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 999,
    color: "#fff",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  checkoutCancelButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
    width: "100%",
  },
  checkoutCancelText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
});
