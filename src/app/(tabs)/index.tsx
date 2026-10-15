import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';

type Category = 'All' | 'Food' | 'Drink';

type Deal = {
  id: number;
  category: Exclude<Category, 'All'>;
  title: string;
  subtitle: string;
  price: string;
  joined: string;
  distance: string;
  timeLeft: string;
  emoji: string;
  tint: string;
  initials: string[];
};

const deals: Deal[] = [
  {
    id: 1,
    category: 'Food',
    title: 'Katsu & Co.',
    subtitle: 'Japanese comfort food',
    price: '฿189',
    joined: '2 of 4 joined',
    distance: '350 m',
    timeLeft: '12 min',
    emoji: '🍱',
    tint: '#fff0f6',
    initials: ['PL', 'NR'],
  },
  {
    id: 2,
    category: 'Drink',
    title: 'Ari Coffee Club',
    subtitle: 'Iced latte bottle set',
    price: '฿125',
    joined: '3 of 5 joined',
    distance: '600 m',
    timeLeft: '18 min',
    emoji: '🧋',
    tint: '#fff3ec',
    initials: ['KA', 'MO', 'JI'],
  },
  {
    id: 3,
    category: 'Food',
    title: 'Weekend snack box',
    subtitle: '12 imported treats',
    price: '฿99',
    joined: '1 of 4 joined',
    distance: '1.2 km',
    timeLeft: '24 min',
    emoji: '🍪',
    tint: '#fff5e9',
    initials: ['AN'],
  },
];

const categories: Category[] = ['All', 'Food', 'Drink'];
const pink = '#d82f78';

export default function HomeScreen() {
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const visibleDeals = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return deals.filter((deal) => {
      const matchesCategory = category === 'All' || deal.category === category;
      const matchesSearch =
        !query ||
        `${deal.title} ${deal.subtitle} ${deal.category}`.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.notificationButton}
          >
            <Text style={styles.notificationIcon}>♧</Text>
            <View style={styles.notificationDot} />
          </Pressable>
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
          <Text style={styles.sectionCaption}>{visibleDeals.length} deals</Text>
        </View>

        {visibleDeals.length > 0 ? (
          <View style={styles.dealList}>
            {visibleDeals.map((deal) => (
              <DealCard deal={deal} key={deal.id} />
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

function DealCard({ deal }: { deal: Deal }) {
  return (
    <View style={styles.dealCard}>
      <View style={[styles.dealArtwork, { backgroundColor: deal.tint }]}>
        <Text style={styles.dealEmoji}>{deal.emoji}</Text>
      </View>
      <View style={styles.dealDetails}>
        <View style={styles.timeRow}>
          <Text style={styles.clockIcon}>◷</Text>
          <Text style={styles.timeText}>{deal.timeLeft} left</Text>
        </View>
        <Text numberOfLines={1} style={styles.dealTitle}>
          {deal.title}
        </Text>
        <Text numberOfLines={1} style={styles.dealSubtitle}>
          {deal.subtitle}
        </Text>
        <View style={styles.joinedRow}>
          <View style={styles.avatarStack}>
            {deal.initials.map((initial, index) => (
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
          <Text style={styles.joinedText}>{deal.joined}</Text>
        </View>
      </View>
      <View style={styles.priceColumn}>
        <Text style={styles.price}>{deal.price}</Text>
        <Text style={styles.perPerson}>per person</Text>
        <Text style={styles.distance}>⌖ {deal.distance}</Text>
      </View>
    </View>
  );
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
  notificationIcon: {
    color: '#514c59',
    fontSize: 24,
    lineHeight: 29,
    transform: [{ rotate: '180deg' }],
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
});
