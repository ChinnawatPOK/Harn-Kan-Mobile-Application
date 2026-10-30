import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from "@/schemas/auth.schema";
import type { ApiResponse } from "@/types/api.types";

export async function registerAccount(
  input: RegisterInput,
): Promise<RegisterResult> {
  const { data } = await apiClient.post<ApiResponse<RegisterResult>>(
    endpoints.auth.register,
    input,
  );
  return data.data;
}

export async function loginAccount(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiResponse<LoginResult>>(
    endpoints.auth.login,
    input,
  );
  return data.data;
}
