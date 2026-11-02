import * as Location from "expo-location";
import { create } from "zustand";

import {
  distanceInMeters,
  getAreaName,
  type Coordinates,
} from "@/lib/location";

type PermissionState = "undetermined" | "granted" | "denied";

type LocationState = {
  coordinates: Coordinates | null;
  /** When `coordinates` was measured (ms since epoch). */
  updatedAt: number | null;
  areaName: string | null;
  permission: PermissionState;
  isLocating: boolean;
  error: string | null;
  /**
   * Returns the cached position when it is fresh enough, otherwise asks the
   * device for a new fix. Concurrent calls share one request.
   */
  refreshLocation: (options?: {
    force?: boolean;
  }) => Promise<Coordinates | null>;
};

// A position younger than this is reused instead of asking the GPS again.
const FRESH_FOR_MS = 2 * 60 * 1000;
// Accept a cached OS fix this old to show something before the GPS answers.
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;
// Only look up the area name again after moving this far.
const AREA_NAME_REFRESH_METERS = 500;

let pendingRefresh: Promise<Coordinates | null> | null = null;
let areaNameFor: Coordinates | null = null;

function toCoordinates(location: Location.LocationObject): Coordinates {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export const useLocationStore = create<LocationState>()((set, get) => {
  const setPosition = (coordinates: Coordinates, measuredAt: number) => {
    set({ coordinates, updatedAt: measuredAt, error: null });

    if (
      areaNameFor &&
      distanceInMeters(areaNameFor, coordinates) < AREA_NAME_REFRESH_METERS
    ) {
      return;
    }
    areaNameFor = coordinates;
    getAreaName(coordinates)
      .then((areaName) => {
        console.log("Area name for >>>>>", coordinates, "is", areaName);
        if (areaName) set({ areaName });
      })
      .catch((error: unknown) => {
        // Display only, so a failed lookup keeps the previous name.
        areaNameFor = null;
        console.warn("Unable to look up the area name.", error);
      });
  };

  const ensurePermission = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.UNDETERMINED) {
      ({ status } = await Location.requestForegroundPermissionsAsync());
    }
    const permission: PermissionState =
      status === Location.PermissionStatus.GRANTED
        ? "granted"
        : status === Location.PermissionStatus.DENIED
          ? "denied"
          : "undetermined";
    set({ permission });
    return permission === "granted";
  };

  const locate = async () => {
    set({ isLocating: true });
    try {
      if (!(await ensurePermission())) {
        set({ error: "Location permission is not granted." });
        return null;
      }

      if (!get().coordinates) {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: LAST_KNOWN_MAX_AGE_MS,
        }).catch(() => null);
        if (lastKnown)
          setPosition(toCoordinates(lastKnown), lastKnown.timestamp);
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = toCoordinates(current);
      setPosition(coordinates, current.timestamp);
      return coordinates;
    } catch (error: unknown) {
      console.error("Unable to get the current location.", error);
      set({ error: "Current location is not available." });
      return get().coordinates;
    } finally {
      set({ isLocating: false });
    }
  };

  return {
    coordinates: null,
    updatedAt: null,
    areaName: null,
    permission: "undetermined",
    isLocating: false,
    error: null,

    refreshLocation: async ({ force = false } = {}) => {
      const { coordinates, updatedAt } = get();
      if (
        !force &&
        coordinates &&
        updatedAt &&
        Date.now() - updatedAt < FRESH_FOR_MS
      ) {
        return coordinates;
      }

      pendingRefresh ??= locate().finally(() => {
        pendingRefresh = null;
      });
      return pendingRefresh;
    },
  };
});
