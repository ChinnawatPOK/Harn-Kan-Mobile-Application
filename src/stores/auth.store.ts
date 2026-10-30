import { create } from "zustand";

import { queryClient } from "@/lib/query-client";
import {
  canPersistSecurely,
  deleteAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/secure-storage";

type AuthState = {
  accessToken: string | null;
  isRestoring: boolean;
  restoreSession: () => Promise<void>;
  saveAccessToken: (token: string) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  isRestoring: canPersistSecurely,

  restoreSession: async () => {
    try {
      set({ accessToken: await getAccessToken() });
    } catch (error: unknown) {
      console.error("Unable to restore the saved access token.", error);
    } finally {
      set({ isRestoring: false });
    }
  },

  saveAccessToken: async (token) => {
    await setAccessToken(token);
    set({ accessToken: token });
  },

  clearSession: async () => {
    set({ accessToken: null });
    queryClient.clear();
    await deleteAccessToken().catch((error: unknown) => {
      console.error("Unable to delete the saved access token.", error);
    });
  },
}));
