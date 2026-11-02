import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatBaht } from "@/utils/format";

// Stands in for Stripe's PaymentSheet until @stripe/stripe-react-native is
// added. Shows a prefilled test card; nothing is sent anywhere.
export function MockPaymentSheet({
  amount,
  isProcessing,
  onCancel,
  onPay,
}: {
  amount: number;
  isProcessing: boolean;
  onCancel: () => void;
  onPay: () => void;
}) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.title}>Add your payment information</Text>
        <Text style={styles.testBadge}>TEST MODE</Text>
      </View>

      <Text style={styles.label}>Card information</Text>
      <View style={styles.fieldGroup}>
        <View style={[styles.field, styles.fieldRow, styles.fieldDivider]}>
          <Text style={styles.fieldValue}>4242 4242 4242 4242</Text>
          <Text style={styles.cardBrand}>VISA</Text>
        </View>
        <View style={styles.fieldRow}>
          <View
            style={[styles.field, styles.fieldHalf, styles.fieldDividerRight]}
          >
            <Text style={styles.fieldValue}>12 / 34</Text>
          </View>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.fieldValue}>123</Text>
          </View>
        </View>
      </View>

      <Text style={styles.label}>Country or region</Text>
      <View style={[styles.fieldGroup, styles.field]}>
        <Text style={styles.fieldValue}>Thailand</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isProcessing, disabled: isProcessing }}
        disabled={isProcessing}
        onPress={onPay}
        style={({ pressed }) => [
          styles.payButton,
          isProcessing && styles.payButtonDisabled,
          pressed && styles.pressed,
        ]}
      >
        {isProcessing ? <ActivityIndicator color="#fff" size="small" /> : null}
        <Text style={styles.payButtonText}>
          {isProcessing ? "Processing…" : `Pay ${formatBaht(amount)}`}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={isProcessing}
        onPress={onCancel}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Text style={styles.footnote}>Mock card sheet · no card is charged</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    height: 5,
    marginBottom: 20,
    width: 40,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    color: "#0f172a",
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "800",
  },
  testBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 999,
    color: "#b45309",
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldGroup: {
    borderColor: "#e2e8f0",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  field: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldHalf: {
    flex: 1,
  },
  fieldDivider: {
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
  },
  fieldDividerRight: {
    borderRightColor: "#e2e8f0",
    borderRightWidth: 1,
  },
  fieldValue: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
  cardBrand: {
    color: "#1d4ed8",
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "900",
  },
  payButton: {
    alignItems: "center",
    backgroundColor: "#db2777",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
    paddingVertical: 16,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.85,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#e2e8f0",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
  },
  cancelText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
  footnote: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
  },
});
