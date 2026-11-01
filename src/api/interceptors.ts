import { isAxiosError, type AxiosInstance } from "axios";

import { ApiError, toApiError } from "@/api/errors";
import { useAuthStore } from "@/stores/auth.store";
import { camelCaseKeys } from "@/utils/case";

const getApiBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Set EXPO_PUBLIC_API_BASE_URL to the Gateway address.");
  }
  return baseUrl;
};

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    config.baseURL ??= getApiBaseUrl();

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      response.data = camelCaseKeys(response.data);
      return response;
    },
    (error: unknown) => {
      const apiError = toApiError(error);
      const sentToken =
        isAxiosError(error) && Boolean(error.config?.headers?.Authorization);
      if (
        sentToken &&
        apiError instanceof ApiError &&
        apiError.status === 401
      ) {
        void useAuthStore.getState().clearSession();
      }
      return Promise.reject(apiError);
    },
  );
}
