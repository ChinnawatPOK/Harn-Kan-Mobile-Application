import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "harnkan.accessToken";

export const canPersistSecurely = Platform.OS !== "web";

export async function getAccessToken() {
  return canPersistSecurely ? SecureStore.getItemAsync(ACCESS_TOKEN_KEY) : null;
}

export async function setAccessToken(token: string) {
  if (canPersistSecurely) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }
}

export async function deleteAccessToken() {
  if (canPersistSecurely) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }
}
