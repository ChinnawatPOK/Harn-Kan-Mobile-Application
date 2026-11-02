import { useEffect } from "react";
import { AppState } from "react-native";

import { useLocationStore } from "@/stores/location.store";

/**
 * Reads the shared device location and keeps it fresh: refreshes on mount and
 * whenever the app returns to the foreground (the store skips the GPS call
 * while its cached position is still fresh).
 */
export function useCurrentLocation() {
  const coordinates = useLocationStore((state) => state.coordinates);
  const areaName = useLocationStore((state) => state.areaName);
  const permission = useLocationStore((state) => state.permission);
  const isLocating = useLocationStore((state) => state.isLocating);
  const error = useLocationStore((state) => state.error);
  const refreshLocation = useLocationStore((state) => state.refreshLocation);

  useEffect(() => {
    void refreshLocation();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshLocation();
    });
    return () => subscription.remove();
  }, [refreshLocation]);

  return { coordinates, areaName, permission, isLocating, error, refreshLocation };
}
