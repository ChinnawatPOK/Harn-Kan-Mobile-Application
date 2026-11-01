import type { ReactElement, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type StripePaymentSheetPayButtonProps = {
  buttonStyle: StyleProp<ViewStyle>;
  children: ReactNode;
  clientSecret: string | null;
  dealId: string;
  disabledStyle?: StyleProp<ViewStyle>;
  onClientSecretChange: (clientSecret: string | null) => void;
  paymentId: string;
  pressedStyle?: StyleProp<ViewStyle>;
};

export function StripePaymentSheetProvider({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return <>{children}</>;
}

export function StripePaymentSheetPayButton(
  _props: StripePaymentSheetPayButtonProps,
) {
  return (
    <View>
      <Text accessibilityRole="alert" style={styles.error}>
        Stripe Payment Sheet is available on iOS and Android only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
});
