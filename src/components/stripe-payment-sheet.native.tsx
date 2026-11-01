import { useState, type ReactElement, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  PaymentSheetError,
  StripeProvider,
  useStripe,
} from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";

import {
  dealDetailQueryKey,
  paymentQueryKey,
} from "@/hooks/useDealDetails";
import { startPayment } from "@/services/payment.service";

const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function StripePaymentSheetProvider({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  if (!stripePublishableKey) {
    return <>{children}</>;
  }

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      urlScheme="harnkanmobileapplication"
    >
      {children}
    </StripeProvider>
  );
}

export function StripePaymentSheetPayButton({
  buttonStyle,
  children,
  clientSecret,
  dealId,
  disabledStyle,
  onClientSecretChange,
  paymentId,
  pressedStyle,
}: {
  buttonStyle: StyleProp<ViewStyle>;
  children: ReactNode;
  clientSecret: string | null;
  dealId: string;
  disabledStyle?: StyleProp<ViewStyle>;
  onClientSecretChange: (clientSecret: string | null) => void;
  paymentId: string;
  pressedStyle?: StyleProp<ViewStyle>;
}) {
  if (!stripePublishableKey) {
    return (
      <Text accessibilityRole="alert" style={styles.error}>
        Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env to enable Stripe payments.
      </Text>
    );
  }

  return (
    <ConfiguredPaymentSheetButton
      buttonStyle={buttonStyle}
      clientSecret={clientSecret}
      dealId={dealId}
      disabledStyle={disabledStyle}
      onClientSecretChange={onClientSecretChange}
      paymentId={paymentId}
      pressedStyle={pressedStyle}
    >
      {children}
    </ConfiguredPaymentSheetButton>
  );
}

function ConfiguredPaymentSheetButton({
  buttonStyle,
  children,
  clientSecret: existingClientSecret,
  dealId,
  disabledStyle,
  onClientSecretChange,
  paymentId,
  pressedStyle,
}: {
  buttonStyle: StyleProp<ViewStyle>;
  children: ReactNode;
  clientSecret: string | null;
  dealId: string;
  disabledStyle?: StyleProp<ViewStyle>;
  onClientSecretChange: (clientSecret: string | null) => void;
  paymentId: string;
  pressedStyle?: StyleProp<ViewStyle>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pay = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      let clientSecret = existingClientSecret;
      if (!clientSecret) {
        const payment = await startPayment(paymentId);
        clientSecret = payment.clientSecret;
        if (!clientSecret) {
          throw new Error(
            "The payment service did not return a Stripe client secret.",
          );
        }
        onClientSecretChange(clientSecret);
      }

      const { error: initializationError } = await initPaymentSheet({
        merchantDisplayName: "Harn Kan",
        paymentIntentClientSecret: clientSecret,
        returnURL: "harnkanmobileapplication://stripe-redirect",
      });
      if (initializationError) {
        throw new Error(initializationError.message);
      }

      const { didCancel, error: presentationError } =
        await presentPaymentSheet();
      if (
        didCancel ||
        presentationError?.code === PaymentSheetError.Canceled
      ) {
        setNotice("Payment canceled. You can try again.");
        return;
      }
      if (presentationError) {
        throw new Error(presentationError.message);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentQueryKey(paymentId),
        }),
        queryClient.invalidateQueries({
          queryKey: dealDetailQueryKey(dealId),
        }),
        queryClient.invalidateQueries({ queryKey: ["my-deals"] }),
      ]);
      onClientSecretChange(null);
      router.push({
        pathname: "/deal/post-payment",
        params: { id: dealId, paymentId },
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start the payment.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={() => void pay()}
        style={({ pressed }) => [
          buttonStyle,
          pressed && pressedStyle,
          isLoading && disabledStyle,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          children
        )}
      </Pressable>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : notice ? (
        <Text style={styles.notice}>{notice}</Text>
      ) : null}
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
  notice: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
