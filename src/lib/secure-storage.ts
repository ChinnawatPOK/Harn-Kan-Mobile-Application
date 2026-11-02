import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "harnkan.accessToken";

export const canPersistSecurely = Platform.OS !== "web";

export async function getAccessToken() {
  console.log("SecureStore.getItemAsync", canPersistSecurely, ACCESS_TOKEN_KEY);
  return canPersistSecurely ? SecureStore.getItemAsync(ACCESS_TOKEN_KEY) : null;
}

export async function setAccessToken(token: string) {
  console.log(
    "SecureStore.setItemAsync",
    canPersistSecurely,
    ACCESS_TOKEN_KEY,
    token,
  );
  if (canPersistSecurely) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }
}

export async function deleteAccessToken() {
  if (canPersistSecurely) {
    console.log(
      "SecureStore.deleteItemAsync",
      canPersistSecurely,
      ACCESS_TOKEN_KEY,
    );
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }
}
