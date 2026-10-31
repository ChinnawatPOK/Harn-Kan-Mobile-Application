import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";

export const currentUserProfileQueryKey = ["current-user-profile"] as const;

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: currentUserProfileQueryKey,
    queryFn: getCurrentUserProfile,
    enabled: Boolean(accessToken),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(currentUserProfileQueryKey, profile);
    },
  });
}
