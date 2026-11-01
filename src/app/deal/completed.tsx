import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BrandMark } from '@/components/brand-mark';
import { DealApiState } from '@/components/deal-api-state';
import {
  useDealDetails,
  useDealReceipt,
} from '@/hooks/useDealDetails';
import type { DealParticipantStatus } from '@/types/deal.types';

export default function CompletedDealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const dealId = firstParam(params.id);
  const dealQuery = useDealDetails(dealId);
  const deal = dealQuery.data;
  const receiptQuery = useDealReceipt(
    deal?.status === 'COMPLETED' ? deal.id : undefined,
  );

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
  const receipt = receiptQuery.data;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to my deals"
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/my-deals')}
            style={styles.backButton}
          >
            <Icon color="#be185d" name="back" size={20} />
          </Pressable>
          <View style={styles.brandMark}>
            <BrandMark compact />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.dealCard}>
            <DealVisual compact />
            <View style={styles.dealInfo}>
              <Text style={styles.categoryBadge}>{categoryLabel(deal.category)}</Text>
              <Text numberOfLines={1} style={styles.dealName}>
                {deal.dealName}
              </Text>
              <Text numberOfLines={1} style={styles.dealDescription}>
                {deal.details || deal.pickupLocation}
              </Text>
              <Text style={styles.dealPrice}>
                ฿{deal.totalPrice.toLocaleString()} total
              </Text>
            </View>
          </View>

          {deal.status === 'COMPLETED' ? (
            <View style={styles.successBanner}>
              <View style={styles.successIcon}>
                <Icon color="#fff" name="check" size={23} />
              </View>
              <View style={styles.successCopy}>
                <Text style={styles.successTitle}>Deal Completed</Text>
                <Text style={styles.successDescription}>
                  {receipt
                    ? `Receipt ${receipt.receiptNo} · ${new Date(receipt.completedAt).toLocaleString()}`
                    : 'Loading the official receipt…'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.receiptError}>
              <Text style={styles.receiptErrorText}>
                Deal status: {deal.status}. The receipt becomes available after completion.
              </Text>
            </View>
          )}

          {receipt ? (
            <View style={styles.receiptCard}>
              <Text style={styles.receiptHeading}>Receipt {receipt.receiptNo}</Text>
              {receipt.lines.map((line, index) => (
                <View key={`${line.role}-${line.name}-${index}`} style={styles.receiptLine}>
                  <View style={styles.receiptLineInfo}>
                    <Text style={styles.receiptName}>{line.name}</Text>
                    <Text style={styles.receiptRole}>{line.role}</Text>
                  </View>
                  <Text style={styles.receiptAmount}>
                    ฿{line.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
              <View style={styles.receiptTotal}>
                <Text style={styles.receiptHeading}>Payout to host</Text>
                <Text style={styles.receiptAmount}>
                  ฿{receipt.payoutToHost.toLocaleString()}
                </Text>
              </View>
            </View>
          ) : receiptQuery.isError ? (
            <View style={styles.receiptError}>
              <Text style={styles.successDescription}>
                {receiptQuery.error.message}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void receiptQuery.refetch()}
                style={styles.receiptRetry}
              >
                <Text style={styles.receiptRetryText}>Retry receipt</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.sectionCount}>
                {deal.joinedSlots} of {deal.targetSlots} slots
              </Text>
            </View>
            <View style={styles.participantCard}>
              {deal.participants.map((person, index) => (
                <View
                  key={`${person.userId}-${person.slotNo}`}
                  style={[
                    styles.participantRow,
                    index < deal.participants.length - 1 &&
                      styles.participantRowBorder,
                  ]}
                >
                  <Avatar label={initialsFor(person.name)} current={false} />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{person.name}</Text>
                    <Text style={styles.participantDetail}>
                      {person.role === 'HOST' ? 'Host' : `Slot ${person.slotNo}`} · {participantStatusLabel(person.status)}
                    </Text>
                  </View>
                  {person.status === 'HELD' || person.status === 'RECEIVED' ? (
                    <View style={styles.paidBadge}>
                      <Icon color="#047857" name="check" size={11} />
                      <Text style={styles.paidBadgeText}>
                        {participantStatusLabel(person.status)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
              {deal.participants.length === 0 ? (
                <Text style={styles.participantDetail}>No participants recorded.</Text>
              ) : null}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!receipt || receiptQuery.isFetching}
            onPress={() => void receiptQuery.refetch()}
            style={({ pressed }) => [
              styles.receiptButton,
              pressed && styles.pressed,
            ]}
          >
            <Icon color="#fff" name="ticket" size={18} />
            <Text style={styles.receiptButtonText}>
              {receiptQuery.isFetching ? 'Refreshing…' : 'Refresh Receipt'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)')}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
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

function DealVisual({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.dealVisual, compact && styles.dealVisualCompact]}>
      <View
        pointerEvents="none"
        style={[styles.visualCircleLarge, compact && styles.visualCircleLargeCompact]}
      />
      <View
        pointerEvents="none"
        style={[styles.visualCircleSmall, compact && styles.visualCircleSmallCompact]}
      />
      <View style={[styles.visualPlate, compact && styles.visualPlateCompact]}>
        <View style={[styles.visualFood, compact && styles.visualFoodCompact]}>
          <View style={styles.foodTop} />
          <View style={[styles.foodLine, compact && styles.foodLineCompact]} />
          <View style={[styles.foodLineShort, compact && styles.foodLineCompact]} />
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
  name: 'back' | 'check' | 'ticket';
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
      {name === 'ticket' ? (
        <>
          <Path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
          <Path d="M13 9h3M13 15h3M8 9v6" />
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brandMark: {
    left: 0,
    position: 'absolute',
    right: 0,
    alignItems: 'center',
  },
  headerSpacer: {
    height: 40,
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  dealCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#fce7f3',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  dealVisual: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    height: 208,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  dealVisualCompact: {
    borderRadius: 16,
    height: 96,
    width: 96,
  },
  visualCircleLarge: {
    backgroundColor: 'rgba(249, 168, 212, 0.7)',
    borderRadius: 999,
    height: 112,
    position: 'absolute',
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
    backgroundColor: '#fbcfe8',
    borderRadius: 999,
    bottom: 12,
    height: 80,
    left: 16,
    position: 'absolute',
    width: 80,
  },
  visualCircleSmallCompact: {
    bottom: 0,
    height: 40,
    left: -12,
    width: 40,
  },
  visualPlate: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 64,
    elevation: 8,
    height: 128,
    justifyContent: 'center',
    shadowColor: '#9d174d',
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
    backgroundColor: '#ec4899',
    borderColor: '#fdf2f8',
    borderRadius: 44,
    borderWidth: 6,
    height: 80,
    overflow: 'hidden',
    width: 80,
  },
  visualFoodCompact: {
    borderRadius: 22,
    borderWidth: 4,
    height: 40,
    width: 40,
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
  foodLineCompact: {
    height: 3,
    marginTop: 2,
  },
  dealInfo: {
    flex: 1,
    minWidth: 0,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fce7f3',
    borderRadius: 999,
    color: '#be185d',
    fontSize: 9,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  dealName: {
    color: '#020617',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 7,
  },
  dealDescription: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  dealPrice: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 7,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    padding: 20,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 24,
    elevation: 3,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#a7f3d0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    width: 48,
  },
  successCopy: {
    flex: 1,
  },
  successTitle: {
    color: '#065f46',
    fontSize: 16,
    fontWeight: '800',
  },
  successDescription: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  receiptHeading: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  receiptLine: {
    alignItems: 'center',
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  receiptLineInfo: {
    flex: 1,
  },
  receiptName: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  receiptRole: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 3,
  },
  receiptAmount: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
  },
  receiptTotal: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  receiptError: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
  },
  receiptErrorText: {
    color: '#9a3412',
    fontSize: 12,
  },
  receiptRetry: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 5,
  },
  receiptRetryText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
  },
  participantsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#020617',
    fontSize: 16,
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
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarCurrent: {
    backgroundColor: '#fbcfe8',
  },
  avatarLabel: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
  },
  participantInfo: {
    flex: 1,
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
  paidBadge: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  paidBadgeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },
  receiptButton: {
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
  receiptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  homeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  homeButtonText: {
    color: '#be185d',
    fontSize: 11,
    fontWeight: '800',
  },
});
