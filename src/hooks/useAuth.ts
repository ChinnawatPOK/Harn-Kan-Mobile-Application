import { useShallow } from "zustand/react/shallow";

import { unregisterPushDevice } from "@/lib/push-notifications";
import { useAuthStore } from "@/stores/auth.store";

async function logout() {
  await unregisterPushDevice();
  await useAuthStore.getState().clearSession();
}

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      isAuthenticated: Boolean(state.accessToken),
      isRestoring: state.isRestoring,
      saveAccessToken: state.saveAccessToken,
      logout,
    })),
  );
}
