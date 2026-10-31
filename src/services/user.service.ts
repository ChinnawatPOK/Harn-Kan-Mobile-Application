import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  UpdateUserProfileInput,
  UserProfile,
} from "@/schemas/user.schema";
import type { ApiResponse } from "@/types/api.types";

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(
    endpoints.users.me,
  );
  return data.data;
}

export async function updateCurrentUserProfile(
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const { data } = await apiClient.put<ApiResponse<UserProfile>>(
    endpoints.users.me,
    input,
  );
  return data.data;
}
