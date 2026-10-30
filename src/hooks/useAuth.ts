import { useShallow } from "zustand/react/shallow";

import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      isAuthenticated: Boolean(state.accessToken),
      isRestoring: state.isRestoring,
      saveAccessToken: state.saveAccessToken,
      logout: state.clearSession,
    })),
  );
}
