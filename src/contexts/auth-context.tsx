import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'harnkan.accessToken';

type AuthContextValue = {
  accessToken: string | null;
  isRestoring: boolean;
  saveAccessToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
      .then(setAccessToken)
      .catch((error: unknown) => {
        console.error('Unable to restore the saved access token.', error);
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const saveAccessToken = useCallback(async (token: string) => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    }
    setAccessToken(token);
  }, []);

  const value = useMemo(
    () => ({ accessToken, isRestoring, saveAccessToken }),
    [accessToken, isRestoring, saveAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
