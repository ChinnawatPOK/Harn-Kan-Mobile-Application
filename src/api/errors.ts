import { isAxiosError } from "axios";

import type { ApiErrorBody } from "@/types/api.types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_ERROR_MESSAGE =
  "Could not connect to the server. Check your network and Gateway URL.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readErrorBody = (data: unknown): ApiErrorBody["error"] => {
  if (!isRecord(data)) {
    return undefined;
  }
  const { code, message } = isRecord(data.error) ? data.error : data;
  return {
    code: typeof code === "string" ? code : undefined,
    message: typeof message === "string" ? message : undefined,
  };
};

export function toApiError(error: unknown): unknown {
  if (!isAxiosError(error)) {
    return error;
  }

  if (!error.response) {
    return new ApiError(
      NETWORK_ERROR_MESSAGE,
      0,
      error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR",
    );
  }

  const { status, data } = error.response;
  const body = readErrorBody(data);
  return new ApiError(
    body?.message ??
      (status === 401
        ? "Your session has expired. Please log in again."
        : "Something went wrong. Please try again."),
    status,
    body?.code,
  );
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
