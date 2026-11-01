import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/stores/auth.store";

export function DealApiState({
  isLoading = false,
  message,
  onRetry,
}: {
  isLoading?: boolean;
  message: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const loading = isLoading || isRestoring;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color="#d82f78" /> : null}
        <Text accessibilityRole={loading ? undefined : "alert"} style={styles.message}>
          {message}
        </Text>
        {!loading && accessToken && onRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        ) : null}
        {!loading && !accessToken ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Sign in</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#d82f78",
    borderRadius: 16,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
