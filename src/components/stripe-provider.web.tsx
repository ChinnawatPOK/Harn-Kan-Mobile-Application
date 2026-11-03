import type { ReactNode } from 'react';

// @stripe/stripe-react-native has no web build; payments are mobile only.
export function AppStripeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function assertCardPaymentReady(): never {
  throw new Error('Please open the mobile app to pay with Stripe.');
}

export function useCardPayment() {
  return async (_clientSecret: string): Promise<'submitted' | 'cancelled'> => {
    return assertCardPaymentReady();
  };
}
