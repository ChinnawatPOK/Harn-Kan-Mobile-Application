import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { getErrorMessage } from '@/api/errors';
import { useAuth } from '@/hooks/useAuth';
import { useMyDeals } from '@/hooks/useMyDeals';
import type {
  DealCategory,
  DealRole,
  MyDeal,
  MyDealsTab as DealListTab,
} from '@/types/deal.types';

type Category = 'All' | 'Food' | 'Drink';
type HistoryRole = 'All Roles' | 'Creator' | 'Participant';
type HistoryStatus = 'All Status' | 'Completed' | 'Canceled' | 'Expired';
type DealStatus =
  | 'Waiting'
  | 'Paid'
  | 'Closed'
  | 'Ready to Order'
  | 'Reserved'
  | 'Waiting for Host'
  | 'Completed'
  | 'Canceled'
  | 'Expired'
  | 'Refunding'
  | 'Refunded';

const categories: Category[] = ['All', 'Food', 'Drink'];

const categoryByFilter: Record<Category, DealCategory | undefined> = {
  All: undefined,
  Food: 'FOOD',
  Drink: 'DRINK',
};
const roleByFilter: Record<HistoryRole, DealRole | undefined> = {
  'All Roles': undefined,
  Creator: 'HOST',
  Participant: 'PARTICIPANT',
};

const statusStyle: Record<
  DealStatus,
  { backgroundColor: string; color: string }
> = {
  Waiting: { backgroundColor: '#fffbeb', color: '#b45309' },
  Paid: { backgroundColor: '#ecfdf5', color: '#047857' },
  Closed: { backgroundColor: '#f1f5f9', color: '#64748b' },
  'Ready to Order': { backgroundColor: '#fce7f3', color: '#be185d' },
  Reserved: { backgroundColor: '#fff7ed', color: '#c2410c' },
  'Waiting for Host': { backgroundColor: '#fce7f3', color: '#be185d' },
  Completed: { backgroundColor: '#ecfdf5', color: '#047857' },
  Canceled: { backgroundColor: '#fef2f2', color: '#dc2626' },
  Expired: { backgroundColor: '#f1f5f9', color: '#64748b' },
  Refunding: { backgroundColor: '#fff7ed', color: '#c2410c' },
  Refunded: { backgroundColor: '#ecfdf5', color: '#047857' },
};

export default function MyDealsTab() {
  const router = useRouter();
  const { accessToken, isRestoring } = useAuth();
  const [tab, setTab] = useState<DealListTab>('joined');
  const [createdCategory, setCreatedCategory] = useState<Category>('All');
  const [joinedCategory, setJoinedCategory] = useState<Category>('All');
  const [historyCategory, setHistoryCategory] = useState<Category>('All');
  const [historyRole, setHistoryRole] = useState<HistoryRole>('All Roles');
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('All Status');

  const activeCategory =
    tab === 'created'
      ? createdCategory
      : tab === 'joined'
        ? joinedCategory
        : historyCategory;
  const dealsQuery = useMyDeals({
    tab,
    category: categoryByFilter[activeCategory],
    ...(tab === 'history' && roleByFilter[historyRole]
      ? { role: roleByFilter[historyRole] }
      : {}),
  });
  const allDeals = dealsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const dealsToShow =
    tab === 'history' && historyStatus !== 'All Status'
      ? allDeals.filter(
          (deal) => getHistoryStatus(deal) === historyStatus,
        )
      : allDeals;
  const totalDeals = dealsQuery.data?.pages[0]?.total ?? 0;
  const isLoading = isRestoring || (Boolean(accessToken) && dealsQuery.isPending);

  const setCategory = (category: Category) => {
    if (tab === 'created') setCreatedCategory(category);
    if (tab === 'joined') setJoinedCategory(category);
    if (tab === 'history') setHistoryCategory(category);
  };

  const openDeal = (deal: MyDeal) => {
    router.push({
      pathname: '/deal/[id]',
      params: { id: deal.id },
    });
  };

  const sectionTitle =
    tab === 'created'
      ? 'Active Deals You Host'
      : tab === 'joined'
        ? 'Active Deals You Joined'
        : 'Past Deals';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Text style={styles.topBarTitle}>My Deals</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.mainTabs}>
            {(['created', 'joined', 'history'] as const).map((item) => {
              const selected = tab === item;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => setTab(item)}
                  style={[styles.mainTab, selected && styles.mainTabSelected]}
                >
                  <Text
                    style={[
                      styles.mainTabText,
                      selected && styles.mainTabTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
              <Text style={styles.sectionSubtitle}>
                {tab === 'history'
                  ? historyStatus === 'All Status'
                  ? `${totalDeals} past deals`
                  : `${dealsToShow.length} shown`
                  : `${totalDeals} active and recent deals`}
              </Text>
            </View>
            {tab === 'created' ? (
              <Pressable
                accessibilityLabel="Create a new deal"
                accessibilityRole="button"
                onPress={() => router.push('/(tabs)/create')}
                style={styles.headingIconButton}
              >
                <Icon color="#be185d" name="plus" size={17} />
              </Pressable>
            ) : tab === 'joined' ? (
              <View style={styles.headingIconButton}>
                <Icon color="#be185d" name="people" size={17} />
              </View>
            ) : null}
          </View>

          {tab === 'history' ? (
            <ScrollView
              contentContainerStyle={styles.filterList}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {categories.map((item) => (
                <FilterChip
                  key={`category-${item}`}
                  label={item}
                  selected={historyCategory === item}
                  onPress={() => setHistoryCategory(item)}
                  compact
                />
              ))}
              <View style={styles.filterDivider} />
              {(['All Roles', 'Creator', 'Participant'] as const).map((item) => (
                <FilterChip
                  compact
                  key={`role-${item}`}
                  label={item}
                  onPress={() => setHistoryRole(item)}
                  selected={historyRole === item}
                />
              ))}
              <View style={styles.filterDivider} />
              {(['All Status', 'Completed', 'Canceled', 'Expired'] as const).map(
                (item) => (
                  <FilterChip
                    compact
                    key={`status-${item}`}
                    label={item}
                    onPress={() => setHistoryStatus(item)}
                    selected={historyStatus === item}
                  />
                ),
              )}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.filterList}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {categories.map((item) => (
                <FilterChip
                  key={`${tab}-${item}`}
                  label={item}
                  onPress={() => setCategory(item)}
                  selected={activeCategory === item}
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.dealList}>
            {isLoading ? (
              <View style={styles.statusState}>
                <ActivityIndicator color="#be185d" />
                <Text style={styles.statusMessage}>Loading your deals...</Text>
              </View>
            ) : !accessToken ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Log in to view your deals</Text>
                <Text style={styles.emptyMessage}>
                  Sign in to see deals you created or joined.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/(auth)/login')}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Log in</Text>
                </Pressable>
              </View>
            ) : dealsQuery.isError && !dealsQuery.data ? (
              <View style={styles.emptyState}>
                <Text accessibilityRole="alert" style={styles.emptyTitle}>
                  Could not load your deals
                </Text>
                <Text style={styles.emptyMessage}>
                  {getErrorMessage(
                    dealsQuery.error,
                    'Please check your connection and try again.',
                  )}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={dealsQuery.isFetching}
                  onPress={() => {
                    void dealsQuery.refetch();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>
                    {dealsQuery.isFetching ? 'Retrying…' : 'Try again'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              dealsToShow.map((deal) => (
                <DealCard
                  deal={deal}
                  key={`${tab}-${deal.id}`}
                  onPress={() => openDeal(deal)}
                  showReadiness={tab === 'created'}
                />
              ))
            )}
            {!isLoading &&
            !dealsQuery.isError &&
            accessToken &&
            dealsToShow.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No deals found</Text>
                <Text style={styles.emptyMessage}>
                  Try changing the selected filters.
                </Text>
              </View>
            ) : null}
            {dealsQuery.isError && dealsQuery.data ? (
              <View style={styles.loadMoreError}>
                <Text accessibilityRole="alert" style={styles.loadMoreErrorText}>
                  Could not load more deals.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={dealsQuery.isFetching}
                  onPress={() => {
                    void dealsQuery.fetchNextPage();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : null}
            {dealsQuery.hasNextPage &&
            !dealsQuery.isError &&
            !dealsQuery.isFetchingNextPage ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void dealsQuery.fetchNextPage();
                }}
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Load more deals</Text>
              </Pressable>
            ) : null}
            {dealsQuery.isFetchingNextPage ? (
              <ActivityIndicator
                accessibilityLabel="Loading more deals"
                color="#be185d"
                style={styles.loadMoreIndicator}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.filterChip,
        compact && styles.filterChipCompact,
        selected ? styles.filterChipSelected : styles.filterChipUnselected,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          compact && styles.filterChipTextCompact,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DealCard({
  deal,
  onPress,
  showReadiness,
}: {
  deal: MyDeal;
  onPress: () => void;
  showReadiness: boolean;
}) {
  const status = getDisplayStatus(deal);
  const badgeStyle = statusStyle[status];
  const category = deal.category === 'FOOD' ? 'Food' : 'Drink';
  const role = deal.myRole === 'HOST' ? 'Creator' : 'Participant';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.dealCard,
        pressed && styles.dealCardPressed,
      ]}
    >
      <View style={styles.dealCardTop}>
        <View style={styles.dealIcon}>
          <Icon
            color="#db2777"
            name={deal.category === 'FOOD' ? 'food' : 'ticket'}
            size={21}
          />
        </View>
        <View style={styles.dealSummary}>
          <View style={styles.dealTitleRow}>
            <Text numberOfLines={1} style={styles.dealName}>
              {deal.dealName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: badgeStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: badgeStyle.color }]}>
                {status}
              </Text>
            </View>
          </View>
          <View style={styles.dealMeta}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{category}</Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>Role: {role}</Text>
            </View>
            <Text style={styles.dealDate}>{formatDealDate(deal.expiresAt)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>TOTAL PRICE</Text>
        <Text style={styles.priceValue}>
          ฿{deal.totalPrice.toLocaleString()}
        </Text>
      </View>
      {showReadiness ? (
        <View style={styles.readinessRow}>
          <Icon color="#db2777" name="people" size={13} />
          <Text style={styles.readinessText}>
            {deal.readySlots} of {deal.targetSlots} participants ready
          </Text>
        </View>
      ) : null}
      {deal.readyToOrder ? (
        <View style={styles.readinessRow}>
          <Text style={styles.readinessText}>Ready to Order</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function getHistoryStatus(deal: MyDeal): HistoryStatus {
  const status = getDisplayStatus(deal);
  if (status === 'Completed') return 'Completed';
  if (status === 'Canceled') return 'Canceled';
  if (status === 'Expired') return 'Expired';
  return 'All Status';
}

function getDisplayStatus(deal: MyDeal): DealStatus {
  if (deal.dealStatus === 'COMPLETED') return 'Completed';
  if (deal.dealStatus === 'CANCELLED') return 'Canceled';
  if (deal.dealStatus === 'EXPIRED') return 'Expired';

  if (deal.myStatus === 'REFUND_PENDING') return 'Refunding';
  if (deal.myStatus === 'REFUNDED') return 'Refunded';
  if (deal.myStatus === 'FAILED') return 'Canceled';

  if (deal.myRole === 'HOST') {
    if (deal.readyToOrder) return 'Ready to Order';
    return deal.dealStatus === 'LOCKED' ? 'Closed' : 'Waiting';
  }

  switch (deal.myStatus) {
    case 'RESERVED':
      return 'Reserved';
    case 'PAYMENT_PENDING':
      return 'Waiting';
    case 'HELD':
      return 'Paid';
    case 'RECEIVED':
      return 'Waiting for Host';
    default:
      return deal.dealStatus === 'LOCKED' ? 'Closed' : 'Waiting';
  }
}

function formatDealDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name: 'food' | 'people' | 'plus' | 'ticket';
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
      {name === 'plus' ? <Path d="M12 5v14M5 12h14" /> : null}
      {name === 'people' ? (
        <>
          <Circle cx="9" cy="8" r="3" />
          <Path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
        </>
      ) : null}
      {name === 'food' ? (
        <>
          <Path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" />
          <Path d="M17 3v18M17 3c-3 2-3 8 0 9" />
        </>
      ) : null}
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
    backgroundColor: '#fff7fb',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarSpacer: {
    minWidth: 40,
  },
  topBarTitle: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  mainTabs: {
    backgroundColor: '#fdf2f8',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 4,
  },
  mainTab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  mainTabSelected: {
    backgroundColor: '#db2777',
    elevation: 3,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  mainTabText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  mainTabTextSelected: {
    color: '#fff',
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  headingIconButton: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  filterList: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipCompact: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: '#db2777',
    elevation: 2,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
  },
  filterChipUnselected: {
    backgroundColor: '#fff',
    borderColor: '#fce7f3',
    borderWidth: 1,
  },
  filterChipText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
  },
  filterChipTextCompact: {
    fontSize: 10,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  filterDivider: {
    backgroundColor: '#fce7f3',
    height: 24,
    marginHorizontal: 2,
    width: 1,
  },
  dealList: {
    gap: 12,
  },
  dealCard: {
    backgroundColor: '#fff',
    borderColor: '#f1f5f9',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 3,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  dealCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  dealCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  dealIcon: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  dealSummary: {
    flex: 1,
    minWidth: 0,
  },
  dealTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  dealName: {
    color: '#020617',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    paddingTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  dealMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#fce7f3',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryTagText: {
    color: '#be185d',
    fontSize: 9,
    fontWeight: '700',
  },
  roleTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleTagText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  dealDate: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  priceRow: {
    alignItems: 'center',
    borderTopColor: '#f1f5f9',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  priceValue: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '800',
  },
  readinessRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  readinessText: {
    color: '#db2777',
    fontSize: 10,
    fontWeight: '700',
  },
  statusState: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  statusMessage: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 10,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#be185d',
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 16,
    marginTop: 4,
    paddingVertical: 14,
  },
  loadMoreText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
  },
  loadMoreError: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadMoreErrorText: {
    color: '#b42354',
    fontSize: 12,
  },
  loadMoreIndicator: {
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#f1f5f9',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyMessage: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
