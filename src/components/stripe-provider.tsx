import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import type { ReactNode } from 'react';

// Only a pk_test_/pk_live_ key belongs in the app; the secret key stays on
// the Payment Service.
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Where Stripe returns after a redirect (e.g. 3D Secure). Expo Go needs the
// '/--/' marker before the app's own path.
const urlScheme =
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL('');

export function AppStripeProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    if (__DEV__) {
      console.warn('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set; Stripe is off.');
    }
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme={urlScheme}>
      <>{children}</>
    </StripeProvider>
  );
}
