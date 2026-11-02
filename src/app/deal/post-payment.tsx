import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { getErrorMessage } from '@/api/errors';
import { DealDetailSkeleton } from '@/components/deal-detail-skeleton';
import { useConfirmReceipt, useDeal } from '@/hooks/useDeals';
import { useProfile } from '@/hooks/useProfile';
import { dealScreenFor } from '@/lib/deal-routing';
import type { DealParticipant } from '@/schemas/deal.schema';
import { formatBaht } from '@/utils/format';

type RowStatus = 'Host' | 'Paid' | 'Received' | 'Waiting' | 'Open';

function initialsOf(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return letters.slice(0, 2).toUpperCase() || '?';
}

function participantRow(participant: DealParticipant): {
  detail: string;
  status: RowStatus;
} {
  switch (participant.status) {
    case 'HOST':
      return { detail: 'Deal creator', status: 'Host' };
    case 'HELD':
      return { detail: 'Payment complete', status: 'Paid' };
    case 'RECEIVED':
      return { detail: 'Item received', status: 'Received' };
    default:
      return { detail: 'Waiting for payment', status: 'Waiting' };
  }
}

export default function PostPaymentDealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealId = firstParam(id);
  const dealQuery = useDeal(dealId);
  const profile = useProfile();
  const confirmReceipt = useConfirmReceipt();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deal = dealQuery.data;

  if (!deal && !dealQuery.isError) {
    return <DealDetailSkeleton onBack={() => router.back()} />;
  }

  if (!deal) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.stateTitle}>Could not load this deal</Text>
          <Text style={styles.stateMessage}>
            {getErrorMessage(
              dealQuery.error,
              'Something went wrong. Please try again.',
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void dealQuery.refetch()}
            style={[styles.modalConfirmButton, styles.retryButton]}
          >
            <Text style={styles.modalConfirmText}>Try again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[styles.modalCancelButton, styles.retryButton]}
          >
            <Text style={styles.modalCancelText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Completed deals (e.g. after the last confirm) and other states move on.
  const screen = dealScreenFor(deal);
  if (screen !== '/deal/post-payment') {
    return <Redirect href={{ pathname: screen, params: { id: deal.id } }} />;
  }

  const me = deal.me;
  const isReceived = me?.status === 'RECEIVED';
  const canConfirmReceipt = me?.actions.canConfirmReceipt ?? false;
  const paidAmount = me?.amountToPay || deal.pricePerSlot;
  const category = deal.category === 'FOOD' ? 'Food' : 'Drink';
  const openSlots = Math.max(0, deal.targetSlots - deal.participants.length);
  const myUserId = profile.data?.id;

  const bannerTitle = isReceived
    ? 'You confirmed your item'
    : `Your ${formatBaht(paidAmount)} payment is complete`;
  const bannerDescription = isReceived
    ? 'The deal completes once everyone confirms they received their item.'
    : canConfirmReceipt
      ? 'Everyone has paid. Pick up your item, then confirm below.'
      : 'Your spot is secured. Waiting for the others to pay.';

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await dealQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const openConfirmModal = () => {
    confirmReceipt.reset();
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    if (confirmReceipt.isPending) return;
    setShowConfirmModal(false);
  };

  // A COMPLETED response redirects to the completed screen on re-render.
  const confirmReceived = () => {
    confirmReceipt.mutate(deal.id, {
      onSuccess: () => setShowConfirmModal(false),
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
              style={styles.heroButton}
            >
              <Icon color="#0f172a" name="back" size={20} />
            </Pressable>
            <View style={styles.paidBadge}>
              <Icon color="#047857" name="check" size={12} />
              <Text style={styles.paidBadgeText}>
                {isReceived ? 'RECEIVED' : 'PAID'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.dealHeader}>
            <View style={styles.dealInfo}>
              <Text style={styles.categoryBadge}>{category}</Text>
              <Text style={styles.dealTitle}>{deal.dealName}</Text>
              <Text style={styles.dealSubtitle}>
                {deal.details || deal.pickupLocation}
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.totalPrice}>{formatBaht(deal.totalPrice)}</Text>
              <Text style={styles.totalPriceLabel}>TOTAL PRICE</Text>
            </View>
          </View>

          <View style={styles.paymentBanner}>
            <View style={styles.paymentCheck}>
              <Icon color="#fff" name="check" size={19} />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={styles.paymentTitle}>{bannerTitle}</Text>
              <Text style={styles.paymentDescription}>{bannerDescription}</Text>
            </View>
          </View>

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.sectionCount}>
                {deal.joinedSlots} of {deal.targetSlots} slots
              </Text>
            </View>
            <View style={styles.participantCard}>
              {deal.participants.map((participant, index) => {
                const isCurrent =
                  Boolean(myUserId) && participant.userId === myUserId;
                const row = participantRow(participant);
                return (
                  <ParticipantRow
                    detail={row.detail}
                    initials={initialsOf(participant.name)}
                    isCurrent={isCurrent}
                    key={participant.slotNo}
                    last={openSlots === 0 && index === deal.participants.length - 1}
                    name={isCurrent ? 'You' : participant.name}
                    status={row.status}
                  />
                );
              })}
              {Array.from({ length: openSlots }, (_, index) => (
                <ParticipantRow
                  detail="Available"
                  initials="+"
                  isCurrent={false}
                  key={`open-${index}`}
                  last={index === openSlots - 1}
                  name="Empty slot"
                  status="Open"
                />
              ))}
            </View>
          </View>

          {canConfirmReceipt ? (
            <Pressable
              accessibilityRole="button"
              onPress={openConfirmModal}
              style={({ pressed }) => [
                styles.confirmReceivedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Icon color="#fff" name="check" size={18} />
              <Text style={styles.confirmReceivedText}>Confirm Item Received</Text>
            </Pressable>
          ) : !isReceived ? (
            <Text style={styles.confirmHint}>
              You can confirm receipt once every slot is paid.
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={styles.reportIssueButton}
          >
            <Text style={styles.reportIssueText}>Report Issue</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={closeConfirmModal}
        transparent
        visible={showConfirmModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close confirmation"
            accessibilityRole="button"
            onPress={closeConfirmModal}
            style={styles.modalBackdrop}
          />
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.orderIcon}>
              <Icon color="#db2777" name="bag" size={25} />
            </View>
            <Text style={styles.modalTitle}>Confirm Item Received?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you have received your exact order from the host?
              This action cannot be undone.
            </Text>
            {confirmReceipt.error ? (
              <Text accessibilityRole="alert" style={styles.actionError}>
                {getErrorMessage(
                  confirmReceipt.error,
                  'Could not confirm. Please try again.',
                )}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={confirmReceipt.isPending}
              onPress={confirmReceived}
              style={({ pressed }) => [
                styles.modalConfirmButton,
                pressed && styles.buttonPressed,
                confirmReceipt.isPending && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.modalConfirmText}>
                {confirmReceipt.isPending ? 'Confirming…' : 'Yes, Confirm'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={confirmReceipt.isPending}
              onPress={closeConfirmModal}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function ParticipantRow({
  detail,
  initials,
  isCurrent,
  last,
  name,
  status,
}: {
  detail: string;
  initials: string;
  isCurrent: boolean;
  last: boolean;
  name: string;
  status: RowStatus;
}) {
  return (
    <View style={[styles.participantRow, !last && styles.participantRowBorder]}>
      <View style={[styles.avatar, isCurrent && styles.currentAvatar]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{name}</Text>
        <Text style={styles.participantDetail}>{detail}</Text>
      </View>
      <StatusBadge status={status} />
    </View>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  const isDone = status === 'Paid' || status === 'Received';
  const badgeStyle = isDone
    ? styles.paidStatus
    : status === 'Waiting'
      ? styles.waitingStatus
      : styles.hostStatus;
  const textStyle = isDone
    ? styles.paidStatusText
    : status === 'Waiting'
      ? styles.waitingStatusText
      : styles.hostStatusText;

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      {isDone ? <Icon color="#047857" name="check" size={11} /> : null}
      <Text style={[styles.statusText, textStyle]}>{status}</Text>
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
  name: 'back' | 'bag' | 'check';
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
      {name === 'bag' ? (
        <>
          <Path d="M6 8h12l-1 12H7L6 8Z" />
          <Path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </>
      ) : null}
      {name === 'check' ? <Path d="m5 12 4 4L19 6" /> : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    alignItems: 'center',
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
  paidBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    elevation: 2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paidBadgeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
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
  },
  dealInfo: {
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
  priceInfo: {
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
  paymentBanner: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
    padding: 16,
  },
  paymentCheck: {
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  paymentCopy: {
    flex: 1,
  },
  paymentTitle: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '800',
  },
  paymentDescription: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  participantsSection: {},
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#94a3b8',
    fontSize: 11,
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
  participantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  participantRowBorder: {
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  currentAvatar: {
    backgroundColor: '#fbcfe8',
  },
  avatarText: {
    color: '#9d174d',
    fontSize: 9,
    fontWeight: '800',
  },
  participantInfo: {
    flex: 1,
    minWidth: 0,
  },
  participantName: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  participantDetail: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  paidStatus: {
    backgroundColor: '#ecfdf5',
  },
  paidStatusText: {
    color: '#047857',
  },
  waitingStatus: {
    backgroundColor: '#fffbeb',
  },
  waitingStatusText: {
    color: '#b45309',
  },
  hostStatus: {
    backgroundColor: '#f1f5f9',
  },
  hostStatusText: {
    color: '#64748b',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  confirmReceivedButton: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 16,
    elevation: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 16,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  confirmReceivedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmHint: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  actionError: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateMessage: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'stretch',
    width: 'auto',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  reportIssueButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
  },
  reportIssueText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
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
    borderColor: '#fce7f3',
    borderRadius: 32,
    borderWidth: 1,
    elevation: 18,
    padding: 24,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    width: '100%',
  },
  orderIcon: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 16,
    elevation: 2,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#fce7f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    width: 56,
  },
  modalTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 20,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  modalConfirmButton: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 16,
    elevation: 6,
    marginTop: 24,
    paddingVertical: 16,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    width: '100%',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
    width: '100%',
  },
  modalCancelText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
});
