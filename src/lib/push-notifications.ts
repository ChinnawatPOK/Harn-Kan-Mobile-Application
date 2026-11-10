import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

import type { PushNotificationData } from "@/schemas/notification.schema";
import {
  registerDevice,
  unregisterDevice,
} from "@/services/notification.service";

const ANDROID_CHANNEL_ID = "default";
const UNREGISTER_TIMEOUT_MS = 3_000;
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isIosSimulator = Platform.OS === "ios" && !Device.isDevice;

/**
 * Simulators running our own build (Xcode or EAS) get no remote push: the
 * project has no APNs key yet. Expo Go is signed with Expo's credentials, so
 * it gets real pushes even on a simulator.
 */
export const isPushlessSimulator = !Device.isDevice && !isExpoGo;

// Pushes that arrive while the app is open still show as a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// The token this device registered for the signed-in user, so logout can
// remove it without asking Expo again.
let registeredToken: string | null = null;
// The access token that registration was done for, so a new login (even one
// after a 401 sign-out that skipped unregisterPushDevice) registers again.
let registeredSession: string | null = null;
// The Expo token for the native token it was made from. The native token only
// changes when APNs/FCM rolls it, so later logins skip the Expo request.
let expoTokenFor: { deviceToken: string; expoToken: string } | null = null;
// One sync at a time: the native token fetch inside a sync also fires the
// push token event, which must not start a second one.
let inFlight: Promise<void> | null = null;

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

async function hasPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function getExpoToken(
  projectId: string,
  devicePushToken?: Notifications.DevicePushToken,
): Promise<string> {
  const device =
    devicePushToken ?? (await Notifications.getDevicePushTokenAsync());
  const deviceToken = String(device.data);
  if (expoTokenFor?.deviceToken !== deviceToken) {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId,
      devicePushToken: device,
      development: isIosSimulator ? true : undefined,
    });
    expoTokenFor = { deviceToken, expoToken: data };
  }
  return expoTokenFor.expoToken;
}

async function sync(
  session: string,
  devicePushToken?: Notifications.DevicePushToken,
): Promise<void> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (isPushlessSimulator) {
    await hasPermission();
    return;
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn(
      "Push notifications are off: set extra.eas.projectId (run `eas init`).",
    );
    return;
  }

  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "Deals",
        importance: AndroidImportance.HIGH,
      });
    }
    const granted = await hasPermission();
    const token = await getExpoToken(projectId, devicePushToken);
    if (granted) {
      await registerDevice(token, Platform.OS);
      registeredToken = token;
      registeredSession = session;
    } else {
      await unregisterDevice(token);
      registeredToken = null;
    }
  } catch (error: unknown) {
    console.warn("Unable to register for push notifications.", error);
  }
}

/**
 * Registers this device's Expo push token with the Notification Service,
 * once per signed-in session (logout resets it). When the user has turned
 * notifications off, the token is removed instead. Never throws: push is
 * best-effort and the inbox works without it.
 */
export function syncPushDevice(session: string): Promise<void> {
  if (registeredSession === session) return Promise.resolve();
  inFlight ??= sync(session).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Re-registers only when APNs/FCM actually hands out a new token. */
export function handlePushTokenChange(
  devicePushToken: Notifications.DevicePushToken,
): void {
  const session = registeredSession;
  if (inFlight || !session) return;
  if (String(devicePushToken.data) === expoTokenFor?.deviceToken) return;
  inFlight = sync(session, devicePushToken).finally(() => {
    inFlight = null;
  });
}

/** Stops pushes to this device for the user who is signing out. */
export async function unregisterPushDevice(): Promise<void> {
  const token = registeredToken;
  registeredSession = null;
  if (!token) return;
  registeredToken = null;
  // Don't hold up logout on a slow network; the service also drops tokens
  // that Expo reports as unregistered.
  await Promise.race([
    unregisterDevice(token).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, UNREGISTER_TIMEOUT_MS)),
  ]);
}

export function pushDataOf(
  notification: Notifications.Notification,
): PushNotificationData {
  const data = notification.request.content.data as
    | PushNotificationData
    | undefined;
  return data ?? {};
}
