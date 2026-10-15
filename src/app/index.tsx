import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  pink50: "#fdf2f8",
  pink100: "#fce7f3",
  pink200: "#fbcfe8",
  pink300: "#f9a8d4",
  pink400: "#f472b6",
  pink500: "#ec4899",
  pink600: "#db2777",
  pink800: "#9d174d",
  pink950: "#500724",
  slate950: "#020617",
  slate400: "#94a3b8",
  white: "#ffffff",
};

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Continue to login"
      accessibilityRole="button"
      onPress={() => router.replace("/(auth)/login")}
      style={styles.screen}
    >
      <View pointerEvents="none" style={styles.upperBackground} />
      <View pointerEvents="none" style={styles.lowerBackground} />

      <View
        pointerEvents="none"
        style={[styles.decorativeDot, styles.dotTopLeft]}
      />
      <View
        pointerEvents="none"
        style={[styles.decorativeDot, styles.dotTopRight]}
      />
      <View
        pointerEvents="none"
        style={[styles.decorativeDot, styles.dotBottomLeft]}
      />
      <View
        pointerEvents="none"
        style={[styles.decorativeDot, styles.dotBottomRight]}
      />

      <View pointerEvents="none" style={styles.brandCard}>
        <View style={styles.mascotGroup}>
          <PigMascot />
          <View style={styles.pinkDivider} />
          <View style={styles.bahtCoin}>
            <View style={styles.coinInner}>
              <Text style={styles.bahtText}>฿</Text>
            </View>
          </View>
        </View>

        <View style={styles.wordmark}>
          <Text style={[styles.wordmarkLetter, styles.letterK]}>K</Text>
          <Text style={[styles.wordmarkLetter, styles.letterA]}>A</Text>
          <Text style={[styles.wordmarkLetter, styles.letterN]}>N</Text>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={[styles.poweredBy, { bottom: Math.max(insets.bottom, 18) + 18 }]}
      >
        <Text style={styles.poweredByText}>POWERED BY</Text>
        <View style={styles.mascotBadge}>
          <PigMascot compact />
        </View>
      </View>
    </Pressable>
  );
}

function PigMascot({ compact = false }: { compact?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.pig, compact && styles.pigCompact]}
    >
      <View
        style={[styles.ear, styles.leftEar, compact && styles.earCompact]}
      />
      <View
        style={[styles.ear, styles.rightEar, compact && styles.earCompact]}
      />
      <View style={[styles.pigHead, compact && styles.pigHeadCompact]}>
        <View
          style={[
            styles.blush,
            styles.leftBlush,
            compact && styles.blushCompact,
          ]}
        />
        <View
          style={[
            styles.blush,
            styles.rightBlush,
            compact && styles.blushCompact,
          ]}
        />
        <View
          style={[styles.eye, styles.leftEye, compact && styles.eyeCompact]}
        />
        <View
          style={[styles.eye, styles.rightEye, compact && styles.eyeCompact]}
        />
        <View style={[styles.snout, compact && styles.snoutCompact]}>
          <View
            style={[
              styles.nostril,
              styles.leftNostril,
              compact && styles.nostrilCompact,
            ]}
          />
          <View
            style={[
              styles.nostril,
              styles.rightNostril,
              compact && styles.nostrilCompact,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  upperBackground: {
    backgroundColor: colors.white,
    height: "50%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  lowerBackground: {
    backgroundColor: colors.pink500,
    bottom: 0,
    height: "50%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  decorativeDot: {
    borderRadius: 10,
    position: "absolute",
  },
  dotTopLeft: {
    backgroundColor: colors.pink100,
    height: 12,
    left: 40,
    top: "33%",
    width: 12,
  },
  dotTopRight: {
    backgroundColor: colors.pink200,
    height: 8,
    right: 48,
    top: "25%",
    width: 8,
  },
  dotBottomLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    height: 8,
    left: 56,
    top: "67%",
    width: 8,
  },
  dotBottomRight: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: 12,
    right: 40,
    top: "75%",
    width: 12,
  },
  brandCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.pink100,
    borderRadius: 40,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    maxWidth: "90%",
    paddingHorizontal: 24,
    paddingVertical: 18,
    shadowColor: colors.pink950,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  mascotGroup: {
    alignItems: "center",
    height: 96,
    justifyContent: "center",
    width: 64,
  },
  pig: {
    height: 42,
    justifyContent: "center",
    marginTop: 5,
    width: 42,
  },
  pigCompact: {
    height: 21,
    marginTop: 0,
    transform: [{ scale: 0.5 }],
    width: 42,
  },
  pigHead: {
    alignSelf: "center",
    backgroundColor: colors.pink400,
    borderRadius: 20,
    height: 36,
    marginTop: 5,
    width: 38,
  },
  pigHeadCompact: {
    height: 36,
    width: 38,
  },
  ear: {
    backgroundColor: colors.pink400,
    borderRadius: 3,
    height: 15,
    position: "absolute",
    top: 0,
    width: 13,
    zIndex: 1,
  },
  earCompact: {
    height: 15,
    width: 13,
  },
  leftEar: {
    borderTopLeftRadius: 1,
    left: 5,
    transform: [{ rotate: "-28deg" }],
  },
  rightEar: {
    borderTopRightRadius: 1,
    right: 5,
    transform: [{ rotate: "28deg" }],
  },
  blush: {
    backgroundColor: "rgba(244, 114, 182, 0.65)",
    borderRadius: 6,
    height: 7,
    position: "absolute",
    top: 14,
    width: 7,
  },
  blushCompact: {
    height: 7,
    width: 7,
  },
  leftBlush: {
    left: 4,
  },
  rightBlush: {
    right: 4,
  },
  eye: {
    backgroundColor: colors.pink950,
    borderRadius: 3,
    height: 3.5,
    position: "absolute",
    top: 12,
    width: 3.5,
    zIndex: 2,
  },
  eyeCompact: {
    height: 3.5,
    width: 3.5,
  },
  leftEye: {
    left: 11,
  },
  rightEye: {
    right: 11,
  },
  snout: {
    alignItems: "center",
    backgroundColor: colors.pink200,
    borderRadius: 12,
    bottom: 4,
    flexDirection: "row",
    gap: 5,
    height: 12,
    justifyContent: "center",
    left: 9,
    position: "absolute",
    width: 20,
  },
  snoutCompact: {
    height: 12,
    width: 20,
  },
  nostril: {
    backgroundColor: colors.pink800,
    borderRadius: 2,
    height: 2.5,
    width: 2.5,
  },
  nostrilCompact: {
    height: 2.5,
    width: 2.5,
  },
  leftNostril: {
    marginLeft: 0,
  },
  rightNostril: {
    marginRight: 0,
  },
  pinkDivider: {
    backgroundColor: colors.pink500,
    borderRadius: 6,
    height: 11,
    marginVertical: 6,
    width: 55,
  },
  bahtCoin: {
    alignItems: "center",
    backgroundColor: colors.pink50,
    borderColor: colors.pink500,
    borderRadius: 18,
    borderWidth: 3,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  coinInner: {
    alignItems: "center",
    borderColor: colors.pink200,
    borderRadius: 11,
    borderWidth: 1,
    height: 23,
    justifyContent: "center",
    width: 23,
  },
  bahtText: {
    color: colors.pink600,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
  wordmark: {
    alignItems: "center",
    flexDirection: "row",
  },
  wordmarkLetter: {
    color: colors.slate950,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -3,
  },
  letterK: {
    color: colors.pink600,
    transform: [{ rotate: "-3deg" }],
  },
  letterA: {
    marginTop: 4,
    transform: [{ rotate: "2deg" }],
  },
  letterN: {
    color: colors.pink600,
    transform: [{ rotate: "-2deg" }],
  },
  poweredBy: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 15,
    paddingVertical: 8,
    position: "absolute",
  },
  poweredByText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  mascotBadge: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
    width: 30,
  },
});
