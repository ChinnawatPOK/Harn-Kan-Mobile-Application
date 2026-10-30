// Success envelope the User Service wraps responses in.
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// Error body the Gateway returns on non-2xx responses.
export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};
