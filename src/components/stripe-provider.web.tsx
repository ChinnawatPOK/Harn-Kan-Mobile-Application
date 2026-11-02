import type { ReactNode } from 'react';

// @stripe/stripe-react-native has no web build; payments are mobile only.
export function AppStripeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
