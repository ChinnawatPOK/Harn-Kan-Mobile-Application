import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

import { ApiError } from "@/api/errors";

// React Native has no window focus events, so tell TanStack Query when the
// app is in the foreground: refetches stale queries on return and pauses
// polling in the background.
if (Platform.OS !== "web") {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener("change", (state) => {
      setFocused(state === "active");
    });
    return () => subscription.remove();
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});
