import { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const colors = {
  block: "#f1f5f9",
  hero: "#fce7f3",
  pinkCard: "#fdf2f8",
  pinkBorder: "#fce7f3",
  timer: "#020617",
  timerBlock: "#1e293b",
  ink: "#0f172a",
};

/**
 * Placeholder for the deal screens while GET /api/deals/{id} loads. It follows
 * the shared layout (hero, header, timer, amount, participants) so the real
 * content drops in without a jump.
 */
export function DealDetailSkeleton({ onBack }: { onBack: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 700,
          toValue: 0.45,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 700,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.body}>
        <Animated.View
          accessibilityLabel="Loading deal"
          accessibilityRole="progressbar"
          style={[styles.body, { opacity }]}
        >
          <View style={styles.hero} />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Bone height={18} radius={9} width={64} />
                <Bone height={26} width="85%" />
                <Bone height={14} width="60%" />
              </View>
              <View style={styles.priceInfo}>
                <Bone height={24} width={84} />
                <Bone height={10} width={64} />
              </View>
            </View>

            <View style={styles.timerCard}>
              <View style={styles.row}>
                <Bone
                  color={colors.timerBlock}
                  height={42}
                  radius={21}
                  width={42}
                />
                <View style={styles.rowText}>
                  <Bone color={colors.timerBlock} height={10} width={110} />
                  <Bone color={colors.timerBlock} height={22} width={90} />
                </View>
              </View>
              <Bone
                color={colors.timerBlock}
                height={6}
                radius={3}
                width="100%"
              />
            </View>

            <View style={styles.amountCard}>
              <View style={styles.rowText}>
                <Bone color={colors.pinkBorder} height={10} width={100} />
                <Bone color={colors.pinkBorder} height={26} width={120} />
              </View>
              <Bone
                color={colors.pinkBorder}
                height={46}
                radius={23}
                width={46}
              />
            </View>

            <View style={styles.sectionHeading}>
              <Bone height={18} width={110} />
              <Bone height={12} width={80} />
            </View>
            <View style={styles.participantCard}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[styles.participantRow, index > 0 && styles.divider]}
                >
                  <Bone height={40} radius={20} width={40} />
                  <View style={styles.rowText}>
                    <Bone height={14} width="55%" />
                    <Bone height={10} width="30%" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Outside the pulse so it stays solid and usable while loading. */}
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Svg
            fill="none"
            height={20}
            stroke={colors.ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            width={20}
          >
            <Path d="m15 18-6-6 6-6" />
          </Svg>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Bone({
  color = colors.block,
  height,
  radius = 8,
  width,
}: {
  color?: string;
  height: number;
  radius?: number;
  width: DimensionValue;
}) {
  return (
    <View
      style={{ backgroundColor: color, borderRadius: radius, height, width }}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  body: {
    flex: 1,
  },
  hero: {
    backgroundColor: colors.hero,
    height: 208,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 8,
    width: 40,
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerInfo: {
    flex: 1,
    gap: 10,
  },
  priceInfo: {
    alignItems: "flex-end",
    gap: 8,
  },
  timerCard: {
    backgroundColor: colors.timer,
    borderRadius: 24,
    gap: 16,
    marginTop: 18,
    padding: 20,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  amountCard: {
    alignItems: "center",
    backgroundColor: colors.pinkCard,
    borderColor: colors.pinkBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 16,
    padding: 20,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  participantCard: {
    borderColor: colors.block,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  participantRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  divider: {
    borderTopColor: colors.block,
    borderTopWidth: 1,
  },
});
