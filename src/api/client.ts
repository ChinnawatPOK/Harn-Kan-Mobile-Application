import { create } from "axios";

import { attachInterceptors } from "@/api/interceptors";

export const apiClient = create({
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachInterceptors(apiClient);
