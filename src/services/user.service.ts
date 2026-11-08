import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { Coordinates } from "@/lib/location";
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
    {
      name: input.name,
      phone_number: input.phoneNumber,
    },
  );
  return data.data;
}

export async function updateCurrentUserLocation({
  latitude,
  longitude,
}: Coordinates): Promise<void> {
  await apiClient.patch(endpoints.users.location, { latitude, longitude });
}

export async function deactivateCurrentUser(): Promise<void> {
  await apiClient.delete(endpoints.users.deactivate);
}
