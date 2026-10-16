import { useEffect, useState } from 'react';
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const dealDuration = 15 * 60;
const paymentDuration = 5 * 60;

type JoinerDealProps = {
  reserved?: boolean;
};

export default function JoinerDealScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    category?: string;
    price?: string;
    people?: string;
    reserved?: string;
  }>();

  return <JoinerDeal reserved={params.reserved === 'true'} />;
}

function JoinerDeal({ reserved: initialReserved = false }: JoinerDealProps) {
  const router = useRouter();
  const { name, category, price, people } = useLocalSearchParams<{
    name?: string;
    category?: string;
    price?: string;
    people?: string;
  }>();
  const [reserved, setReserved] = useState(initialReserved);
  const [seconds, setSeconds] = useState(initialReserved ? 299 : paymentDuration);
  const [dealExpirySeconds, setDealExpirySeconds] = useState(886);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDealExpirySeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showCheckout && !reserved) return undefined;

    const interval = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [reserved, showCheckout]);

  const dealName = firstParam(name) || 'Katsu & Co. group order';
  const dealCategory = firstParam(category) || 'Food';
  const dealPrice = Number(firstParam(price) || 756);
  const participantCount = Math.max(2, Math.min(4, Number(firstParam(people)) || 4));
  const amountToPay = Math.ceil(dealPrice / participantCount);
  const countdown = formatTime(seconds);
  const dealExpiryCountdown = formatTime(dealExpirySeconds);
  const dealExpiryProgress = Math.max(
    0,
    Math.min(100, (dealExpirySeconds / dealDuration) * 100),
  );
  const participants = [
    {
      slot: 1,
      name: 'Ploy S.',
      detail: 'Host',
      initials: 'PL',
      isHost: true,
      isCurrent: false,
    },
    {
      slot: 2,
      name: 'Narin K.',
      detail: '',
      initials: 'NR',
      isHost: false,
      isCurrent: false,
    },
    {
      slot: 3,
      name: 'Anya P.',
      detail: '',
      initials: 'AP',
      isHost: false,
      isCurrent: false,
    },
    {
      slot: 4,
      name: reserved ? 'You' : 'Empty slot',
      detail: reserved ? '' : 'Available',
      initials: reserved ? 'YO' : '',
      isHost: false,
      isCurrent: reserved,
    },
  ].slice(0, participantCount);

  const payNow = () => {
    setShowCheckout(false);
    router.push('/deal/post-payment');
  };

  const joinDeal = () => {
    setSeconds(paymentDuration);
    setShowCheckout(true);
  };

  const reserveDeal = () => {
    setReserved(true);
    setSeconds(paymentDuration - 1);
    setShowCheckout(false);
  };

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
              style={styles.backButton}
            >
              <Icon color="#0f172a" name="back" size={20} />
            </Pressable>
            <View style={styles.joinStatus}>
              <Text style={styles.joinStatusText}>
                {reserved ? 'RESERVED' : 'JOINING'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.dealHeader}>
            <View style={styles.dealInfo}>
              <Text style={styles.categoryBadge}>{dealCategory}</Text>
              <Text style={styles.dealName}>{dealName}</Text>
              <Text style={styles.dealDescription}>
                Chicken katsu set + gyoza bundle
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.totalPrice}>
                ฿{dealPrice.toLocaleString()}
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
                <Text style={styles.timerValue}>{dealExpiryCountdown}</Text>
              </View>
              <Text style={styles.activeBadge}>Active</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressValue, { width: `${dealExpiryProgress}%` }]}
              />
            </View>
          </View>

          <View style={styles.amountCard}>
            <View>
              <Text style={styles.amountLabel}>AMOUNT TO PAY</Text>
              <Text style={styles.amountValue}>
                ฿{amountToPay.toLocaleString()}
              </Text>
            </View>
            <View style={styles.walletIcon}>
              <Icon color="#fff" name="wallet" size={22} />
            </View>
          </View>

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.sectionCount}>
                {reserved ? `${participantCount} of 4 slots` : '3 of 4 slots'}
              </Text>
            </View>
            <View style={styles.participantCard}>
              {participants.map((person, index) => (
                <ParticipantRow
                  detail={person.detail}
                  initials={person.initials}
                  isCurrent={person.isCurrent}
                  isHost={person.isHost}
                  key={person.slot}
                  last={index === participants.length - 1}
                  name={person.name}
                  countdown={countdown}
                />
              ))}
            </View>
          </View>

          {reserved ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={payNow}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Icon color="#fff" name="card" size={18} />
                <Text style={styles.primaryButtonText}>Pay Now</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.leaveButton}
              >
                <Text style={styles.leaveButtonText}>Leave Deal</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={joinDeal}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Icon color="#fff" name="people" size={18} />
              <Text style={styles.primaryButtonText}>Join Deal</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowCheckout(false)}
        transparent
        visible={showCheckout}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close checkout"
            accessibilityRole="button"
            onPress={() => setShowCheckout(false)}
            style={styles.modalBackdrop}
          />
          <View style={styles.checkoutCard}>
            <View style={styles.checkoutHandle} />
            <View style={styles.checkoutWalletIcon}>
              <Icon color="#db2777" name="wallet" size={25} />
            </View>
            <Text style={styles.checkoutAmountLabel}>AMOUNT TO PAY</Text>
            <Text style={styles.checkoutAmount}>
              ฿{amountToPay.toLocaleString()}
            </Text>
            <Text style={styles.checkoutDescription}>
              Your exact share of the ฿{dealPrice.toLocaleString()} total
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={payNow}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.checkoutPayButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Icon color="#fff" name="card" size={18} />
              <Text style={styles.primaryButtonText}>Pay Now</Text>
              <Text style={styles.checkoutCountdown}>{countdown}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={reserveDeal}
              style={styles.checkoutCancelButton}
            >
              <Text style={styles.checkoutCancelText}>Cancel</Text>
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

function formatTime(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function ParticipantRow({
  detail,
  initials,
  isCurrent,
  isHost,
  last,
  name,
  countdown,
}: {
  detail: string;
  initials: string;
  isCurrent: boolean;
  isHost: boolean;
  last: boolean;
  name: string;
  countdown: string;
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
      {isCurrent ? (
        <View style={styles.paymentBadge}>
          <Icon color="#b45309" name="clock" size={11} />
          <Text style={styles.paymentBadgeText}>Pay in {countdown}</Text>
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
  name: 'back' | 'card' | 'clock' | 'people' | 'wallet';
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
      {name === 'card' ? (
        <>
          <Rect height="14" rx="2" width="18" x="3" y="5" />
          <Path d="M3 10h18M7 15h3" />
        </>
      ) : null}
      {name === 'clock' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === 'people' ? (
        <>
          <Circle cx="9" cy="8" r="3" />
          <Path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
        </>
      ) : null}
      {name === 'wallet' ? (
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
  backButton: {
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
  joinStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  joinStatusText: {
    color: '#be185d',
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
  dealName: {
    color: '#020617',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 10,
  },
  dealDescription: {
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
  timerCard: {
    backgroundColor: '#020617',
    borderRadius: 24,
    elevation: 10,
    marginTop: 18,
    overflow: 'hidden',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  timerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  timerInfo: {
    flex: 1,
  },
  timerLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  timerValue: {
    color: '#fcd34d',
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 6,
  },
  progressValue: {
    backgroundColor: '#fcd34d',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 4,
    height: '100%',
  },
  amountCard: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderColor: '#fce7f3',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 16,
    padding: 20,
  },
  amountLabel: {
    color: '#ec4899',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  amountValue: {
    color: '#be185d',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  walletIcon: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 24,
    elevation: 4,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: 48,
  },
  participantsSection: {
    marginTop: 4,
  },
  sectionHeading: {
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
  participantAvatar: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  currentParticipantAvatar: {
    backgroundColor: '#fbcfe8',
  },
  participantInitials: {
    color: '#9d174d',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyAvatar: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
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
  emptyParticipantName: {
    color: '#94a3b8',
  },
  participantDetail: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  hostBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hostBadgeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
  },
  paymentBadge: {
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  paymentBadgeText: {
    color: '#b45309',
    fontSize: 9,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  leaveButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  leaveButtonText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  checkoutCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  checkoutHandle: {
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    height: 5,
    marginBottom: 20,
    width: 40,
  },
  checkoutWalletIcon: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  checkoutAmountLabel: {
    color: '#ec4899',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
  },
  checkoutAmount: {
    color: '#020617',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  checkoutDescription: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  checkoutPayButton: {
    marginTop: 24,
    width: '100%',
  },
  checkoutCountdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    color: '#fff',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  checkoutCancelButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
    width: '100%',
  },
  checkoutCancelText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
});
