import { PaymentIntent, PaymentSheetError, StripeProvider, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, type ReactNode } from 'react';

// Only a pk_test_/pk_live_ key belongs in the app; the secret key stays on
// the Payment Service.
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Where Stripe returns after a redirect (e.g. 3D Secure). Expo Go needs the
// '/--/' marker before the app's own path.
const urlScheme =
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL('');

function StripeRedirects() {
  const url = Linking.useLinkingURL();
  const { handleURLCallback } = useStripe();
  useEffect(() => {
    if (url) void handleURLCallback(url);
  }, [url, handleURLCallback]);
  return null;
}

export function assertCardPaymentReady() {
  if (!/^pk_(test|live)_/.test(publishableKey)) {
    throw new Error('Stripe publishable key is not configured.');
  }
}

export function useCardPayment() {
  const { initPaymentSheet, presentPaymentSheet, retrievePaymentIntent } = useStripe();
  return useCallback(async (clientSecret: string): Promise<'submitted' | 'cancelled'> => {
    assertCardPaymentReady();
    const existing = await retrievePaymentIntent(clientSecret);
    if (existing.error) throw new Error(existing.error.message);
    if (existing.paymentIntent?.status === PaymentIntent.Status.Succeeded
      || existing.paymentIntent?.status === PaymentIntent.Status.Processing) return 'submitted';
    const initialized = await initPaymentSheet({
      merchantDisplayName: 'HarnKan',
      paymentIntentClientSecret: clientSecret,
      allowsDelayedPaymentMethods: false,
      returnURL: Linking.createURL('stripe-redirect'),
    });
    if (initialized.error) throw new Error(initialized.error.message);
    const result = await presentPaymentSheet();
    if (result.error?.code === PaymentSheetError.Canceled) return 'cancelled';
    if (result.error) throw new Error(result.error.message);
    return 'submitted';
  }, [initPaymentSheet, presentPaymentSheet, retrievePaymentIntent]);
}

export function AppStripeProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    if (__DEV__) {
      console.warn('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set; Stripe is off.');
    }
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme={urlScheme}>
      <StripeRedirects />
      <>{children}</>
    </StripeProvider>
  );
}
