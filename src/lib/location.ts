import * as Location from "expo-location";
import { Platform } from "react-native";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export const canReverseGeocode = Platform.OS !== "web";

export function distanceInMeters(from: Coordinates, to: Coordinates) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

async function reverseGeocode(coordinates: Coordinates) {
  if (!canReverseGeocode) return null;
  const [address] = await Location.reverseGeocodeAsync(coordinates);
  return address ?? null;
}

function joinParts(parts: (string | null | undefined)[]) {
  const unique = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part, index, all) => all.indexOf(part) === index);
  return unique.length > 0 ? unique.join(", ") : null;
}

export async function getAreaName(coordinates: Coordinates) {
  const address = await reverseGeocode(coordinates);
  if (!address) return null;
  return joinParts([
    address.district ?? address.subregion,
    address.city ?? address.region,
  ]);
}

export async function getPickupLabel(coordinates: Coordinates) {
  const address = await reverseGeocode(coordinates);
  if (!address) return null;
  return joinParts([
    address.name ?? address.street,
    address.district ?? address.subregion,
    address.city ?? address.region,
  ]);
}
