import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DealApiState } from '@/components/deal-api-state';
import { cancelDeal, leaveDeal } from '@/services/deal.service';
import {
  dealDetailQueryKey,
  useDealDetails,
} from '@/hooks/useDealDetails';
import type { DealParticipantStatus } from '@/types/deal.types';

export default function DealScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const dealId = firstParam(id);
  const dealQuery = useDealDetails(dealId);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!dealId) throw new Error('A deal ID is required.');
      return cancelDeal(dealId);
    },
    onSuccess: async (updatedDeal) => {
      queryClient.setQueryData(dealDetailQueryKey(updatedDeal.id), updatedDeal);
      await queryClient.invalidateQueries({ queryKey: ['my-deals'] });
      setShowCancelModal(false);
      router.push({ pathname: '/deal/refund', params: { id: updatedDeal.id } });
    },
  });
  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!dealId) throw new Error('A deal ID is required.');
      return leaveDeal(dealId);
    },
    onSuccess: async (updatedDeal) => {
      queryClient.setQueryData(dealDetailQueryKey(updatedDeal.id), updatedDeal);
      await queryClient.invalidateQueries({ queryKey: ['my-deals'] });
      router.push('/(tabs)/my-deals');
    },
  });
  const deal = dealQuery.data;

  if (!dealId) {
    return <DealApiState message="This deal link is missing its ID." />;
  }

  if (!deal) {
    return (
      <DealApiState
        isLoading={dealQuery.isLoading}
        message={dealQuery.error?.message ?? 'Could not load this deal. Sign in and try again.'}
        onRetry={() => void dealQuery.refetch()}
      />
    );
  }

  const participantCount = deal.participants.length;
  const isHost = deal.me?.role === 'HOST';
  const actions = deal.me?.actions;
  const canJoin = deal.me
    ? deal.me.actions.canJoin
    : deal.actionsIfNotJoined.canJoin;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <DealVisual />
            <View style={styles.heroActions}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.heroButton}
              >
                <Icon color="#0f172a" name="back" size={20} />
              </Pressable>
              <Pressable
                accessibilityLabel={`Deal ID ${deal.id}`}
                accessibilityRole="button"
                style={styles.heroButton}
              >
                <Icon color="#0f172a" name="more" size={20} />
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.dealHeader}>
              <View style={styles.dealMainInfo}>
                <Text style={styles.categoryBadge}>{categoryLabel(deal.category)}</Text>
                <Text style={styles.dealTitle}>{deal.dealName}</Text>
                <Text style={styles.dealSubtitle}>
                  {deal.details || `${categoryLabel(deal.category)} group order`}
                </Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.totalPrice}>
                  ฿{deal.totalPrice.toLocaleString()}
                </Text>
                <Text style={styles.totalPriceLabel}>TOTAL PRICE</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon color="#64748b" name="location" size={15} />
                <Text style={styles.metaText}>
                  {deal.pickupLocation}
                </Text>
              </View>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>
                {deal.status} · Expires {new Date(deal.expiresAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.groupSection}>
              <View style={styles.groupHeading}>
                <Text style={styles.groupTitle}>The group</Text>
                <Text style={styles.groupSlots}>
                  {deal.joinedSlots} of {deal.targetSlots} slots
                </Text>
              </View>
              <View style={styles.participantCard}>
                {deal.participants.map((participant, index) => (
                  <ParticipantRow
                    initials={initialsFor(participant.name)}
                    key={`${participant.userId}-${participant.slotNo}`}
                    last={index === participantCount - 1}
                    name={participant.name}
                    paymentCountdown={undefined}
                    price={deal.pricePerSlot}
                    slot={participant.slotNo}
                    status={participantStatusLabel(participant.status)}
                    statusType={participantStatusType(participant.status)}
                    subtitle={`${participant.role === 'HOST' ? 'Host' : `Slot ${participant.slotNo}`} · ฿${deal.pricePerSlot.toLocaleString()} share`}
                  />
                ))}
                {participantCount === 0 ? (
                  <Text style={styles.emptyParticipants}>No participants yet.</Text>
                ) : null}
              </View>
            </View>

            {isHost ? (
              <View style={styles.creatorNotice}>
                <Icon color="#047857" name="shield" size={18} />
                <Text style={styles.creatorNoticeText}>
                  You are the deal creator. Participant payment and refund
                  statuses are shown above.
                </Text>
              </View>
            ) : null}

            {actions?.canCancel ? (
              <Pressable
                accessibilityRole="button"
                disabled={cancelMutation.isPending}
                onPress={() => setShowCancelModal(true)}
                style={styles.cancelDealButton}
              >
                <Text style={styles.cancelDealText}>
                  {cancelMutation.isPending ? 'Canceling…' : 'Cancel Deal'}
                </Text>
              </Pressable>
            ) : canJoin || actions?.canPay ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/deal/joiner', params: { id: deal.id } })
                }
                style={styles.primaryActionButton}
              >
                <Text style={styles.primaryActionText}>
                  {canJoin ? 'Join Deal' : 'Continue to Payment'}
                </Text>
              </Pressable>
            ) : actions?.canLeave ? (
              <Pressable
                accessibilityRole="button"
                disabled={leaveMutation.isPending}
                onPress={() => void leaveMutation.mutateAsync()}
                style={styles.cancelDealButton}
              >
                <Text style={styles.cancelDealText}>
                  {leaveMutation.isPending ? 'Leaving…' : 'Leave Deal'}
                </Text>
              </Pressable>
            ) : actions?.canConfirmReceipt ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/deal/post-payment',
                    params: { id: deal.id, paymentId: deal.me?.paymentId ?? '' },
                  })
                }
                style={styles.primaryActionButton}
              >
                <Text style={styles.primaryActionText}>Confirm Item Received</Text>
              </Pressable>
            ) : null}
            {cancelMutation.error || leaveMutation.error ? (
              <Text accessibilityRole="alert" style={styles.actionError}>
                {(cancelMutation.error ?? leaveMutation.error)?.message ??
                  'The requested action failed.'}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <BottomBar onNavigate={(route) => router.push(route)} />
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
        transparent
        visible={showCancelModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close cancel confirmation"
            accessibilityRole="button"
            onPress={() => setShowCancelModal(false)}
            style={styles.modalBackdrop}
          />
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.warningIcon}>
              <Icon color="#dc2626" name="warning" size={29} />
            </View>
            <Text style={styles.modalTitle}>Cancel this deal?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to cancel this group order? Any participants
              who have already paid will be fully refunded automatically. This
              action cannot be undone.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={cancelMutation.isPending}
              onPress={() => void cancelMutation.mutateAsync()}
              style={styles.confirmCancelButton}
            >
              <Text style={styles.confirmCancelText}>
                {cancelMutation.isPending ? 'Canceling…' : 'Yes, Cancel Deal'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowCancelModal(false)}
              style={styles.keepDealButton}
            >
              <Text style={styles.keepDealText}>No, Keep Deal</Text>
            </Pressable>
          </View>
          {cancelMutation.error ? (
            <Text accessibilityRole="alert" style={styles.actionError}>
              {cancelMutation.error.message}
            </Text>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function categoryLabel(category: string) {
  return category === 'FOOD' ? 'Food' : 'Drink';
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

function participantStatusLabel(status: DealParticipantStatus) {
  switch (status) {
    case 'HOST':
      return 'Host';
    case 'RESERVED':
      return 'Reserved';
    case 'PAYMENT_PENDING':
      return 'Payment pending';
    case 'HELD':
      return 'Paid';
    case 'RECEIVED':
      return 'Received';
    case 'FAILED':
      return 'Left';
    case 'REFUND_PENDING':
      return 'Refund pending';
    case 'REFUNDED':
      return 'Refunded';
  }
}

function participantStatusType(
  status: DealParticipantStatus,
): 'none' | 'paid' | 'pending' {
  if (status === 'HELD' || status === 'RECEIVED' || status === 'REFUNDED') {
    return 'paid';
  }
  if (status === 'RESERVED' || status === 'PAYMENT_PENDING' || status === 'REFUND_PENDING') {
    return 'pending';
  }
  return 'none';
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

function ParticipantRow({
  initials,
  name,
  subtitle,
  status,
  statusType,
  slot,
  price,
  paymentCountdown,
  last = false,
}: {
  initials: string;
  name: string;
  subtitle?: string;
  status: string;
  statusType: 'none' | 'paid' | 'pending';
  slot?: number;
  price?: number;
  paymentCountdown?: string;
  last?: boolean;
}) {
  const detail = subtitle ?? `Slot ${slot} · ฿${price?.toLocaleString()} share`;

  return (
    <View style={[styles.participantRow, !last && styles.participantRowBorder]}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantInitials}>{initials}</Text>
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{name}</Text>
        <Text style={styles.participantSubtitle}>{detail}</Text>
      </View>
      {statusType === 'paid' ? (
        <View style={[styles.statusPill, styles.paidPill]}>
          <Icon color="#047857" name="check" size={11} />
          <Text style={styles.paidText}>{status}</Text>
        </View>
      ) : statusType === 'pending' ? (
        <View style={[styles.statusPill, styles.pendingPill]}>
          <Icon color="#b45309" name="clock" size={11} />
          <Text style={styles.pendingText}>
            {paymentCountdown || status}
          </Text>
        </View>
      ) : (
        <View style={[styles.statusPill, styles.unpaidPill]}>
          <Text style={styles.unpaidText}>{status}</Text>
        </View>
      )}
  </View>
  );
}

function BottomBar({
  onNavigate,
}: {
  onNavigate: (route: '/(tabs)' | '/(tabs)/create' | '/(tabs)/my-deals' | '/(tabs)/profile') => void;
}) {
  const tabs = [
    { label: 'Explore', route: '/(tabs)' as const, icon: 'home' as const },
    { label: 'Create', route: '/(tabs)/create' as const, icon: 'plus' as const },
    { label: 'My deals', route: '/(tabs)/my-deals' as const, icon: 'ticket' as const },
    { label: 'Profile', route: '/(tabs)/profile' as const, icon: 'profile' as const },
  ];

  return (
    <View style={styles.bottomBar}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="button"
          key={tab.label}
          onPress={() => onNavigate(tab.route)}
          style={styles.bottomTab}
        >
          <Icon color="#94a3b8" name={tab.icon} size={19} />
          <Text style={styles.bottomTabLabel}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name: 'back' | 'check' | 'clock' | 'home' | 'location' | 'more' | 'plus' | 'profile' | 'shield' | 'ticket' | 'warning';
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
      {name === 'back' ? <Path d="m15 18-6-6 6-6" /> : null}
      {name === 'check' ? <Path d="m5 12 4 4L19 6" /> : null}
      {name === 'clock' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === 'home' ? (
        <>
          <Path d="m3 11 9-8 9 8" />
          <Path d="M5 10v10h14V10M9 20v-6h6v6" />
        </>
      ) : null}
      {name === 'location' ? (
        <>
          <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <Circle cx="12" cy="10" r="2.5" />
        </>
      ) : null}
      {name === 'more' ? (
        <>
          <Circle cx="5" cy="12" r="1" fill={color} />
          <Circle cx="12" cy="12" r="1" fill={color} />
          <Circle cx="19" cy="12" r="1" fill={color} />
        </>
      ) : null}
      {name === 'plus' ? <Path d="M12 5v14M5 12h14" /> : null}
      {name === 'profile' ? (
        <>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21a8 8 0 0 1 16 0" />
        </>
      ) : null}
      {name === 'shield' ? (
        <Path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4" />
      ) : null}
      {name === 'ticket' ? (
        <>
          <Path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
          <Path d="M13 9h3M13 15h3M8 9v6" />
        </>
      ) : null}
      {name === 'warning' ? (
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
    backgroundColor: '#fff',
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    height: 208,
    position: 'relative',
  },
  dealVisual: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  visualCircleLarge: {
    backgroundColor: 'rgba(244, 114, 182, 0.65)',
    borderRadius: 999,
    height: 112,
    position: 'absolute',
    right: -32,
    top: 16,
    width: 112,
  },
  visualCircleSmall: {
    backgroundColor: '#fbcfe8',
    borderRadius: 999,
    bottom: 12,
    height: 80,
    left: 16,
    position: 'absolute',
    width: 80,
  },
  visualPlate: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 64,
    elevation: 10,
    height: 128,
    justifyContent: 'center',
    shadowColor: '#9d174d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: 128,
  },
  visualFood: {
    backgroundColor: '#ec4899',
    borderColor: '#fdf2f8',
    borderRadius: 44,
    borderWidth: 6,
    height: 80,
    overflow: 'hidden',
    width: 80,
  },
  foodTop: {
    backgroundColor: 'rgba(251, 207, 232, 0.8)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: '50%',
    width: '100%',
  },
  foodLine: {
    alignSelf: 'center',
    backgroundColor: '#be185d',
    borderRadius: 6,
    height: 6,
    marginTop: 4,
    width: '66%',
  },
  foodLineShort: {
    alignSelf: 'center',
    backgroundColor: '#f9a8d4',
    borderRadius: 6,
    height: 6,
    marginTop: 4,
    width: '50%',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    position: 'absolute',
    right: 20,
    top: 8,
  },
  heroButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 40,
  },
  pickupBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    bottom: 12,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 20,
  },
  pickupDot: {
    backgroundColor: '#10b981',
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  pickupBadgeText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    position: 'relative',
  },
  dealHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dealMainInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fce7f3',
    borderRadius: 999,
    color: '#be185d',
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  dealTitle: {
    color: '#020617',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 10,
  },
  dealSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  totalPrice: {
    color: '#020617',
    fontSize: 22,
    fontWeight: '800',
  },
  totalPriceLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metaDot: {
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    height: 4,
    width: 4,
  },
  metaText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  timerCard: {
    backgroundColor: '#020617',
    borderRadius: 24,
    elevation: 10,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  timerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  timerText: {
    flex: 1,
  },
  timerLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  timerValue: {
    color: '#fff',
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  reservedBadge: {
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
    borderRadius: 999,
    color: '#fcd34d',
    fontSize: 9,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
    height: 5,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: '#fcd34d',
    borderRadius: 4,
    height: '100%',
  },
  groupSection: {
    marginTop: 22,
  },
  groupHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupTitle: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
  },
  groupSlots: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  participantCard: {
    backgroundColor: '#fff',
    borderColor: '#f1f5f9',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emptyParticipants: {
    color: '#64748b',
    fontSize: 13,
    padding: 18,
    textAlign: 'center',
  },
  participantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  participantRowBorder: {
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  participantAvatar: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  participantInitials: {
    color: '#9d174d',
    fontSize: 9,
    fontWeight: '800',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
  },
  participantSubtitle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  unpaidPill: {
    backgroundColor: '#fdf2f8',
  },
  unpaidText: {
    color: '#be185d',
    fontSize: 9,
    fontWeight: '800',
  },
  paidPill: {
    backgroundColor: '#ecfdf5',
  },
  paidText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '800',
  },
  pendingPill: {
    backgroundColor: '#fffbeb',
  },
  pendingText: {
    color: '#b45309',
    fontSize: 9,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  creatorNotice: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 12,
  },
  creatorNoticeText: {
    color: '#065f46',
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
  },
  cancelDealButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
  },
  cancelDealText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
  primaryActionButton: {
    alignItems: 'center',
    backgroundColor: '#d82f78',
    borderRadius: 16,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  actionError: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopColor: '#f1f5f9',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 4,
    paddingTop: 8,
  },
  bottomTab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    paddingVertical: 2,
  },
  bottomTabLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#fee2e2',
    borderRadius: 32,
    borderWidth: 1,
    elevation: 20,
    padding: 24,
    shadowColor: '#450a0a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    width: '100%',
  },
  warningIcon: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: 'rgba(254, 242, 242, 0.6)',
    borderRadius: 40,
    borderWidth: 8,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  modalTitle: {
    color: '#020617',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 20,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  confirmCancelButton: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    elevation: 5,
    marginTop: 24,
    paddingVertical: 15,
    shadowColor: '#fecaca',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    width: '100%',
  },
  confirmCancelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  keepDealButton: {
    alignItems: 'center',
    borderColor: '#fbcfe8',
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 10,
    paddingVertical: 13,
    width: '100%',
  },
  keepDealText: {
    color: '#be185d',
    fontSize: 13,
    fontWeight: '800',
  },
});
