import { useEffect } from "react";
import { AppState } from "react-native";

import { updateCurrentUserLocation } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { useLocationStore } from "@/stores/location.store";

/**
 * Reports the device location to the User Service, which is how the user gets
 * nearby deal notifications: on launch or login, and whenever the app returns
 * to the foreground. Nothing is sent without location permission. Mount it
 * once, in a layout that only renders after login.
 */
export function useLocationSync() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    let stopped = false;
    let sentReading: number | null = null;

    const sync = async () => {
      const coordinates = await useLocationStore.getState().refreshLocation();
      const { permission, updatedAt } = useLocationStore.getState();
      if (stopped || !coordinates || permission !== "granted") return;
      if (updatedAt === sentReading) return;

      sentReading = updatedAt;
      try {
        await updateCurrentUserLocation(coordinates);
      } catch (error: unknown) {
        sentReading = null;
        console.warn("Unable to report the current location.", error);
      }
    };

    void sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void sync();
    });
    return () => {
      stopped = true;
      subscription.remove();
    };
  }, [accessToken]);
}
