import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from "@/schemas/auth.schema";

export async function registerAccount(
  input: RegisterInput,
): Promise<RegisterResult> {
  const { data } = await apiClient.post<RegisterResult>(
    endpoints.auth.register,
    input,
  );
  return data;
}

export async function loginAccount(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>(
    endpoints.auth.login,
    input,
  );
  return data;
}
