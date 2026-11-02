import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
  User,
} from "@/schemas/auth.schema";
import type { ApiResponse } from "@/types/api.types";

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  user: User;
};

export async function registerAccount(
  input: RegisterInput,
): Promise<RegisterResult> {
  await apiClient.post<ApiResponse<{ user: User }>>(endpoints.auth.register, {
    name: input.fullName,
    phone_number: input.phoneNumber,
    password: input.password,
  });
  return loginAccount({
    phoneNumber: input.phoneNumber,
    password: input.password,
  });
}

export async function loginAccount(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    endpoints.auth.login,
    { phone_number: input.phoneNumber, password: input.password },
  );
  return { token: data.data.accessToken, user: data.data.user };
}
