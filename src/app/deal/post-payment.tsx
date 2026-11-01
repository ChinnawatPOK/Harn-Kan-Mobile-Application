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
import Svg, { Path } from 'react-native-svg';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DealApiState } from '@/components/deal-api-state';
import {
  dealDetailQueryKey,
  useDealDetails,
  usePaymentDetails,
} from '@/hooks/useDealDetails';
import { confirmDealReceipt } from '@/services/deal.service';
import type { DealParticipantStatus } from '@/types/deal.types';

export default function PostPaymentDealScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    id?: string | string[];
    paymentId?: string | string[];
  }>();
  const dealId = firstParam(params.id);
  const routePaymentId = firstParam(params.paymentId);
  const dealQuery = useDealDetails(dealId);
  const paymentId = routePaymentId ?? dealQuery.data?.me?.paymentId ?? undefined;
  const paymentQuery = usePaymentDetails(paymentId);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const confirmMutation = useMutation({
    mutationFn: () => {
      if (!dealId) throw new Error('A deal ID is required.');
      return confirmDealReceipt(dealId);
    },
    onSuccess: async (updatedDeal) => {
      queryClient.setQueryData(dealDetailQueryKey(updatedDeal.id), updatedDeal);
      await queryClient.invalidateQueries({ queryKey: ['my-deals'] });
      setShowConfirmModal(false);
      if (updatedDeal.status === 'COMPLETED') {
        router.push({
          pathname: '/deal/completed',
          params: { id: updatedDeal.id },
        });
      }
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

  const paymentStatus = paymentQuery.data?.status ?? deal.me?.status ?? 'UNKNOWN';
  const paymentAmount = paymentQuery.data?.amount ?? String(deal.me?.amountToPay ?? 0);
  const paymentConfirmed = paymentStatus === 'HELD' || paymentStatus === 'RECEIVED';
  const canConfirmReceipt = deal.me?.actions.canConfirmReceipt ?? false;
  const participants = deal.participants;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
            <View style={[styles.paidBadge, !paymentConfirmed && styles.pendingBadge]}>
              <Text
                style={[
                  styles.paidBadgeText,
                  !paymentConfirmed && styles.pendingBadgeText,
                ]}
              >
                {paymentStatusLabel(paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.dealHeader}>
            <View style={styles.dealInfo}>
              <Text style={styles.categoryBadge}>{categoryLabel(deal.category)}</Text>
              <Text style={styles.dealTitle}>{deal.dealName}</Text>
              <Text style={styles.dealSubtitle}>
                {deal.details || deal.pickupLocation}
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.totalPrice}>฿{deal.totalPrice.toLocaleString()}</Text>
              <Text style={styles.totalPriceLabel}>TOTAL PRICE</Text>
            </View>
          </View>

          <View style={styles.paymentBanner}>
            <View
              style={[
                styles.paymentCheck,
                !paymentConfirmed && styles.pendingPaymentCheck,
              ]}
            >
              <Icon
                color="#fff"
                name={paymentStatus === 'HELD' || paymentStatus === 'RECEIVED' ? 'check' : 'clock'}
                size={19}
              />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={styles.paymentTitle}>
                ฿{Number(paymentAmount).toLocaleString()} · {paymentStatusLabel(paymentStatus)}
              </Text>
              <Text style={styles.paymentDescription}>
                {paymentStatus === 'HELD' || paymentStatus === 'RECEIVED'
                  ? 'Your payment is secured. Wait for the host to place the order.'
                  : paymentStatus === 'PAYMENT_PENDING'
                    ? 'Payment has been started. This screen refreshes while the payment provider confirms it.'
                    : `Payment status: ${paymentStatusLabel(paymentStatus)}.`}
              </Text>
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
              {participants.map((person, index) => (
                <ParticipantRow
                  detail={`${person.role === 'HOST' ? 'Host' : `Slot ${person.slotNo}`} · ฿${deal.pricePerSlot.toLocaleString()} share`}
                  initials={initialsFor(person.name)}
                  key={`${person.userId}-${person.slotNo}`}
                  last={index === participants.length - 1}
                  name={person.name}
                  status={participantStatusLabel(person.status)}
                />
              ))}
              {participants.length === 0 ? (
                <Text style={styles.errorText}>No participants yet.</Text>
              ) : null}
            </View>
          </View>

          {canConfirmReceipt ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowConfirmModal(true)}
              style={({ pressed }) => [
                styles.confirmReceivedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Icon color="#fff" name="check" size={18} />
              <Text style={styles.confirmReceivedText}>Confirm Item Received</Text>
            </Pressable>
          ) : (
            <Text style={styles.paymentDescription}>
              {deal.me?.status === 'RECEIVED'
                ? 'You already confirmed receipt.'
                : 'Receipt confirmation becomes available when the API marks your payment as held and the deal is ready.'}
            </Text>
          )}
          {dealQuery.error || paymentQuery.error || confirmMutation.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {confirmMutation.error?.message ??
                paymentQuery.error?.message ??
                dealQuery.error?.message}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
        transparent
        visible={showConfirmModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close confirmation"
            accessibilityRole="button"
            onPress={() => setShowConfirmModal(false)}
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
            <Pressable
              accessibilityRole="button"
              disabled={confirmMutation.isPending}
              onPress={() => void confirmMutation.mutateAsync()}
              style={({ pressed }) => [
                styles.modalConfirmButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalConfirmText}>
                {confirmMutation.isPending ? 'Confirming…' : 'Yes, Confirm'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowConfirmModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
          {confirmMutation.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {confirmMutation.error.message}
            </Text>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ParticipantRow({
  detail,
  initials,
  last,
  name,
  status,
}: {
  detail: string;
  initials: string;
  last: boolean;
  name: string;
  status: string;
}) {
  return (
    <View style={[styles.participantRow, !last && styles.participantRowBorder]}>
      <View style={[styles.avatar, name === 'You' && styles.currentAvatar]}>
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

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === 'Paid' || status === 'Received' || status === 'Refunded';
  const isWaiting = status === 'Reserved' || status === 'Payment pending';
  const badgeStyle = isPaid
    ? styles.paidStatus
    : isWaiting
      ? styles.waitingStatus
      : styles.hostStatus;
  const textStyle = isPaid
    ? styles.paidStatusText
    : isWaiting
      ? styles.waitingStatusText
      : styles.hostStatusText;

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      {isPaid ? (
        <Icon color="#047857" name="check" size={11} />
      ) : null}
      <Text style={[styles.statusText, textStyle]}>{status}</Text>
    </View>
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

function paymentStatusLabel(status: string) {
  return status === 'UNKNOWN'
    ? 'Not available'
    : status
        .toLowerCase()
        .split('_')
        .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
        .join(' ');
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
  name: 'back' | 'bag' | 'check' | 'clock';
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
      {name === 'clock' ? (
        <>
          <Path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
          <Path d="M12 7v5l3 2" />
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
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
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
  pendingBadge: {
    backgroundColor: '#fffbeb',
  },
  pendingBadgeText: {
    color: '#b45309',
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
  pendingPaymentCheck: {
    backgroundColor: '#d97706',
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
