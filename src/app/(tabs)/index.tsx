import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BrandMark } from '@/components/brand-mark';
import { useAuth } from '@/hooks/useAuth';
import { useNearbyDeals } from '@/hooks/useNearbyDeals';
import type { DealCategory, NearbyDeal } from '@/types/deal.types';

type Category = 'All' | 'Food' | 'Drink';

const categories: Category[] = ['All', 'Food', 'Drink'];
const dealCategoryByFilter: Record<Category, DealCategory | undefined> = {
  All: undefined,
  Food: 'FOOD',
  Drink: 'DRINK',
};
const pink = '#d82f78';
const exploreLocation = { lat: 13.78, lng: 100.54 };

export default function HomeScreen() {
  const router = useRouter();
  const { accessToken, isRestoring } = useAuth();
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const dealsQuery = useNearbyDeals({
    ...exploreLocation,
    radius: 500,
    category: dealCategoryByFilter[category],
    q: search.trim() || undefined,
  });
  const visibleDeals = dealsQuery.data?.items ?? [];
  const isLoading = isRestoring || (Boolean(accessToken) && dealsQuery.isPending);
  const now = dealsQuery.dataUpdatedAt || null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <BrandMark compact />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Current location: Ari, Bangkok"
              style={styles.locationButton}
            >
              <Text style={styles.locationText}>Ari, Bangkok</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications')}
            style={styles.notificationButton}
          >
            <Svg
              fill="none"
              height={23}
              stroke="#514c59"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              width={23}
            >
              <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <Path d="M10 21h4" />
            </Svg>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search nearby deals"
            onChangeText={setSearch}
            placeholder="Search nearby deals"
            placeholderTextColor="#9995a1"
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filters}>
          {categories.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          {dealsQuery.data ? (
            <Text style={styles.sectionCaption}>
              {dealsQuery.data.total} deals
            </Text>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.statusState}>
            <ActivityIndicator color={pink} />
            <Text style={styles.statusMessage}>Loading nearby deals...</Text>
          </View>
        ) : !accessToken ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Log in to explore deals</Text>
            <Text style={styles.emptyMessage}>
              Sign in to see deals shared by people nearby.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Log in</Text>
            </Pressable>
          </View>
        ) : dealsQuery.isError ? (
          <View style={styles.emptyState}>
            <Text accessibilityRole="alert" style={styles.emptyTitle}>
              Could not load deals
            </Text>
            <Text style={styles.emptyMessage}>
              {dealsQuery.error instanceof Error
                ? dealsQuery.error.message
                : 'Please try again.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void dealsQuery.refetch();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : visibleDeals.length > 0 ? (
          <View style={styles.dealList}>
            {visibleDeals.map((deal) => (
              <DealCard
                deal={deal}
                key={deal.id}
                now={now}
                onPress={() => router.push('/deal/joiner')}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No deals found</Text>
            <Text style={styles.emptyMessage}>Try a different search or category.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DealCard({
  deal,
  now,
  onPress,
}: {
  deal: NearbyDeal;
  now: number | null;
  onPress: () => void;
}) {
  const isFood = deal.category === 'FOOD';
  return (
    <Pressable
      accessibilityLabel={`Open deal: ${deal.dealName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.dealCard}
    >
      <View
        style={[
          styles.dealArtwork,
          { backgroundColor: isFood ? '#fff0f6' : '#fff3ec' },
        ]}
      >
        <Text style={styles.dealEmoji}>{isFood ? '🍱' : '🧋'}</Text>
      </View>
      <View style={styles.dealDetails}>
        <View style={styles.timeRow}>
          <Text style={styles.clockIcon}>◷</Text>
          <Text style={styles.timeText}>
            {formatTimeLeft(deal.expiresAt, now)} left
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.dealTitle}>
          {deal.dealName}
        </Text>
        <Text numberOfLines={1} style={styles.dealSubtitle}>
          {deal.details ?? ''}
        </Text>
        <View style={styles.joinedRow}>
          <View style={styles.avatarStack}>
            {deal.participantInitials.map((initial, index) => (
              <View
                key={initial}
                style={[
                  styles.avatar,
                  index > 0 && styles.avatarOverlap,
                  { backgroundColor: index % 2 === 0 ? '#f5cadd' : '#f5e4ae' },
                ]}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.joinedText}>
            {deal.joinedSlots} of {deal.targetSlots} joined
          </Text>
        </View>
      </View>
      <View style={styles.priceColumn}>
        <Text style={styles.price}>฿{deal.pricePerSlot}</Text>
        <Text style={styles.perPerson}>per person</Text>
        <Text style={styles.distance}>
          ⌖ {formatDistance(deal.distanceMeters)}
        </Text>
      </View>
    </Pressable>
  );
}

function formatTimeLeft(expiresAt: string, now: number | null) {
  const expiresAtMs = Date.parse(expiresAt);
  if (now === null || !Number.isFinite(expiresAtMs)) {
    return '—';
  }
  const minutesLeft = Math.max(0, Math.ceil((expiresAtMs - now) / 60_000));
  return minutesLeft < 60
    ? `${minutesLeft} min`
    : `${Math.ceil(minutesLeft / 60)} hr`;
}

function formatDistance(distanceMeters: number) {
  return distanceMeters < 1000
    ? `${Math.round(distanceMeters)} m`
    : `${(distanceMeters / 1000).toFixed(1)} km`;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 17,
  },
  locationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },
  locationText: {
    color: '#171321',
    fontSize: 18,
    fontWeight: '800',
  },
  chevron: {
    color: pink,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 24,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: '#f5f3f6',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  notificationDot: {
    backgroundColor: pink,
    borderColor: '#f5f3f6',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 9,
    position: 'absolute',
    right: 10,
    top: 9,
    width: 9,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#f5f3f6',
    borderRadius: 17,
    flexDirection: 'row',
    marginHorizontal: 20,
    minHeight: 49,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: '#888390',
    fontSize: 24,
    lineHeight: 27,
    marginRight: 10,
  },
  searchInput: {
    color: '#171321',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 12,
  },
  clearButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  clearText: {
    color: '#888390',
    fontSize: 22,
    lineHeight: 24,
  },
  filters: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 20,
    paddingTop: 13,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#fff2f8',
    borderRadius: 18,
    minWidth: 58,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterChipSelected: {
    backgroundColor: pink,
    shadowColor: pink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },
  filterText: {
    color: '#a9215b',
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextSelected: {
    color: '#fff',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 26,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#171321',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionCaption: {
    color: '#a09ba7',
    fontSize: 11,
    fontWeight: '700',
  },
  dealList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  dealCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 23,
    flexDirection: 'row',
    minHeight: 122,
    padding: 11,
    shadowColor: '#171321',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  dealArtwork: {
    alignItems: 'center',
    borderRadius: 17,
    height: 84,
    justifyContent: 'center',
    width: 74,
  },
  dealEmoji: {
    fontSize: 36,
  },
  dealDetails: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 11,
    paddingRight: 7,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  clockIcon: {
    color: pink,
    fontSize: 13,
    fontWeight: '800',
  },
  timeText: {
    color: pink,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dealTitle: {
    color: '#171321',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  dealSubtitle: {
    color: '#96919e',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  joinedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 6,
  },
  avatar: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  avatarOverlap: {
    marginLeft: -7,
  },
  avatarText: {
    color: '#655866',
    fontSize: 6,
    fontWeight: '900',
  },
  joinedText: {
    color: '#77717e',
    fontSize: 8,
    fontWeight: '700',
  },
  priceColumn: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    borderLeftColor: '#f0edf2',
    borderLeftWidth: 1,
    justifyContent: 'flex-start',
    paddingLeft: 9,
    paddingTop: 5,
    width: 69,
  },
  price: {
    color: '#171321',
    fontSize: 13,
    fontWeight: '900',
  },
  perPerson: {
    color: '#aaa5b0',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 3,
  },
  distance: {
    color: '#898491',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 'auto',
    paddingBottom: 3,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fff7fb',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 25,
  },
  emptyTitle: {
    color: '#171321',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyMessage: {
    color: '#898594',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  statusState: {
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  statusMessage: {
    color: '#898594',
    fontSize: 12,
    marginTop: 10,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: pink,
    borderRadius: 16,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
