import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { getErrorMessage } from "@/api/errors";
import { BrandMark } from "@/components/brand-mark";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import {
  useNearbyDeals,
  usePrefetchDeal,
  useResolveDealScreen,
} from "@/hooks/useDeals";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import type { DealCategory, NearbyDeal } from "@/schemas/deal.schema";
import { formatBaht, formatDistance, formatTimeLeft } from "@/utils/format";

type Category = "All" | "Food" | "Drink";

type Deal = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  joined: string;
  distance: string;
  timeLeft: string;
  kind: "food" | "drink";
  tint: string;
  initials: string[];
};

const NEARBY_RADIUS_METERS = 500;

const categoryValues: Record<Exclude<Category, "All">, DealCategory> = {
  Food: "FOOD",
  Drink: "DRINK",
};

function toDealCard(deal: NearbyDeal): Deal {
  const isFood = deal.category === "FOOD";
  return {
    id: deal.id,
    title: deal.dealName,
    subtitle: deal.details || (isFood ? "Food" : "Drink"),
    price: formatBaht(deal.pricePerSlot),
    joined: `${deal.joinedSlots} of ${deal.targetSlots} joined`,
    distance: formatDistance(deal.distanceMeters),
    timeLeft: formatTimeLeft(deal.expiresAt),
    kind: isFood ? "food" : "drink",
    tint: isFood ? "#fff0f6" : "#fff3ec",
    initials: deal.participantInitials,
  };
}

const categories: Category[] = ["All", "Food", "Drink"];
const pink = "#d82f78";

export default function HomeScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const { coordinates, areaName, isLocating, permission, refreshLocation } =
    useCurrentLocation();
  const locationLabel =
    areaName ??
    (isLocating
      ? "Locating…"
      : permission === "denied"
        ? "Location off"
        : "Current location");

  const query = useDebouncedValue(search.trim(), 300);
  const prefetchDeal = usePrefetchDeal();
  const resolveDealScreen = useResolveDealScreen();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const isOpening = useRef(false);
  const unreadCount = useUnreadNotificationCount();
  const nearbyDeals = useNearbyDeals(
    coordinates
      ? {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          radius: NEARBY_RADIUS_METERS,
          category: category === "All" ? undefined : categoryValues[category],
          q: query || undefined,
        }
      : null,
  );
  const visibleDeals = useMemo(
    () => nearbyDeals.data?.items.map(toDealCard) ?? [],
    [nearbyDeals.data],
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Open the screen for the deal's current state once it has loaded (the
  // press-in prefetch usually has it already). Pushing /deal/joiner right away
  // showed a blank loading screen, plus a Redirect for own or paid deals.
  const openDeal = async (dealId: string) => {
    if (isOpening.current) return;
    isOpening.current = true;
    setOpeningId(dealId);
    try {
      const pathname = await resolveDealScreen(dealId);
      router.push({ pathname, params: { id: dealId } });
    } finally {
      isOpening.current = false;
      setOpeningId(null);
    }
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLocation({ force: true });
      await nearbyDeals.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const emptyState = !coordinates
    ? permission === "denied"
      ? {
          title: "Location is off",
          message: "Turn on location in Settings to see deals near you.",
        }
      : null
    : nearbyDeals.isError
      ? {
          title: "Could not load deals",
          message: getErrorMessage(
            nearbyDeals.error,
            "Something went wrong. Please try again.",
          ),
        }
      : {
          title: "No deals found",
          message:
            query || category !== "All"
              ? "Try a different search or category."
              : "No deals nearby yet. Create one!",
        };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor={pink}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <BrandMark compact />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              onPress={() => router.push("/notifications")}
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
              {unreadCount > 0 ? (
                <View style={styles.notificationDot} />
              ) : null}
            </TouchableOpacity>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${locationLabel}`}
            onPress={() => void refreshLocation({ force: true })}
            style={styles.locationButton}
          >
            <Text numberOfLines={1} style={styles.locationText}>
              {locationLabel}
            </Text>
            <Text style={styles.chevron}>›</Text>
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
              onPress={() => setSearch("")}
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
                style={[
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          <Text style={styles.sectionCaption}>
            {nearbyDeals.data?.total ?? 0} deals
          </Text>
        </View>

        {visibleDeals.length > 0 ? (
          <View style={styles.dealList}>
            {visibleDeals.map((deal) => (
              <DealCard
                deal={deal}
                isOpening={openingId === deal.id}
                key={deal.id}
                onPressIn={() => prefetchDeal(deal.id)}
                onPress={() => void openDeal(deal.id)}
              />
            ))}
          </View>
        ) : nearbyDeals.isLoading || (!coordinates && isLocating) ? (
          <ActivityIndicator color={pink} style={styles.loading} />
        ) : emptyState ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{emptyState.title}</Text>
            <Text style={styles.emptyMessage}>{emptyState.message}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryIcon({ kind }: { kind: Deal["kind"] }) {
  return (
    <Svg
      fill="none"
      height={38}
      stroke={kind === "food" ? pink : "#ea580c"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={38}
    >
      {kind === "food" ? (
        <>
          <Path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
          <Path d="M9 20.5h6" />
          <Path d="M9 4.5c-1 1 1 2 0 3.5M13 4.5c-1 1 1 2 0 3.5M17 4.5c-1 1 1 2 0 3.5" />
        </>
      ) : (
        <>
          <Path d="M5.5 8h13" />
          <Path d="M7 8l1.3 12.5h7.4L17 8" />
          <Path d="M12 8l1.5-5.5h3" />
          <Circle cx="10.5" cy="16.5" r="0.8" />
          <Circle cx="13.5" cy="17.5" r="0.8" />
          <Circle cx="12" cy="14" r="0.8" />
        </>
      )}
    </Svg>
  );
}

function DealCard({
  deal,
  isOpening,
  onPress,
  onPressIn,
}: {
  deal: Deal;
  isOpening: boolean;
  onPress: () => void;
  onPressIn: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Open deal: ${deal.title}`}
      accessibilityRole="button"
      accessibilityState={{ busy: isOpening }}
      onPress={onPress}
      onPressIn={onPressIn}
      style={[styles.dealCard, isOpening && styles.dealCardOpening]}
    >
      <View style={[styles.dealArtwork, { backgroundColor: deal.tint }]}>
        <CategoryIcon kind={deal.kind} />
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
                key={`${initial}-${index}`}
                style={[
                  styles.avatar,
                  index > 0 && styles.avatarOverlap,
                  { backgroundColor: index % 2 === 0 ? "#f5cadd" : "#f5e4ae" },
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 17,
  },
  // Logo and bell share a row; the area name gets its own full-width line.
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
    maxWidth: "100%",
  },
  locationText: {
    color: "#171321",
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  chevron: {
    color: pink,
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 24,
    // Centers the chevron under the 44pt bell when the name is truncated.
    marginRight: 18,
  },
  notificationButton: {
    alignItems: "center",
    backgroundColor: "#f5f3f6",
    borderRadius: 22,
    flexShrink: 0,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  notificationDot: {
    backgroundColor: pink,
    borderColor: "#f5f3f6",
    borderRadius: 5,
    borderWidth: 1.5,
    height: 9,
    position: "absolute",
    right: 10,
    top: 9,
    width: 9,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "#f5f3f6",
    borderRadius: 17,
    flexDirection: "row",
    marginHorizontal: 20,
    minHeight: 49,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: "#888390",
    fontSize: 24,
    lineHeight: 27,
    marginRight: 10,
  },
  searchInput: {
    color: "#171321",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 12,
  },
  clearButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  clearText: {
    color: "#888390",
    fontSize: 22,
    lineHeight: 24,
  },
  filters: {
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 20,
    paddingTop: 13,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#fff2f8",
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
    color: "#a9215b",
    fontSize: 12,
    fontWeight: "800",
  },
  filterTextSelected: {
    color: "#fff",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 26,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#171321",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionCaption: {
    color: "#a09ba7",
    fontSize: 11,
    fontWeight: "700",
  },
  dealList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  dealCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 23,
    flexDirection: "row",
    minHeight: 122,
    padding: 11,
    shadowColor: "#171321",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  dealCardOpening: {
    opacity: 0.6,
  },
  dealArtwork: {
    alignItems: "center",
    borderRadius: 17,
    height: 84,
    justifyContent: "center",
    width: 74,
  },
  dealDetails: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 11,
    paddingRight: 7,
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  clockIcon: {
    color: pink,
    fontSize: 13,
    fontWeight: "800",
  },
  timeText: {
    color: pink,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dealTitle: {
    color: "#171321",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  dealSubtitle: {
    color: "#96919e",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  joinedRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 9,
  },
  avatarStack: {
    flexDirection: "row",
    marginRight: 6,
  },
  avatar: {
    alignItems: "center",
    borderColor: "#fff",
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  avatarOverlap: {
    marginLeft: -7,
  },
  avatarText: {
    color: "#655866",
    fontSize: 6,
    fontWeight: "900",
  },
  joinedText: {
    color: "#77717e",
    fontSize: 8,
    fontWeight: "700",
  },
  priceColumn: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    borderLeftColor: "#f0edf2",
    borderLeftWidth: 1,
    justifyContent: "flex-start",
    paddingLeft: 9,
    paddingTop: 5,
    width: 69,
  },
  price: {
    color: "#171321",
    fontSize: 13,
    fontWeight: "900",
  },
  perPerson: {
    color: "#aaa5b0",
    fontSize: 8,
    fontWeight: "600",
    marginTop: 3,
  },
  distance: {
    color: "#898491",
    fontSize: 8,
    fontWeight: "700",
    marginTop: "auto",
    paddingBottom: 3,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#fff7fb",
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 25,
  },
  emptyTitle: {
    color: "#171321",
    fontSize: 15,
    fontWeight: "800",
  },
  emptyMessage: {
    color: "#898594",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  loading: {
    marginTop: 32,
  },
});
