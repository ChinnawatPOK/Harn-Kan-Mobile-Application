import { ApiError } from '@/services/auth-api';

export type UserProfile = {
  id: string;
  name: string;
  phone_number: string;
};

export type UpdateUserProfileInput = {
  name: string;
  phone_number: string;
};

const getApiBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Set EXPO_PUBLIC_API_BASE_URL to the Gateway address.');
  }
  return baseUrl;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

async function requestUserProfile(
  token: string,
  method: 'GET' | 'PUT',
  input?: UpdateUserProfileInput,
): Promise<UserProfile> {
  const response = await fetch(`${getApiBaseUrl()}/api/users/me`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(input ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(input ? { body: JSON.stringify(input) } : {}),
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const errorPayload =
      isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
    throw new ApiError(
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : 'Unable to load your profile.',
      response.status,
      typeof errorPayload?.code === 'string' ? errorPayload.code : undefined,
    );
  }

  const user =
    isRecord(payload) && isRecord(payload.data) ? payload.data : undefined;
  if (
    !user ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.phone_number !== 'string'
  ) {
    throw new Error('The user profile response from the server is invalid.');
  }

  return {
    id: user.id,
    name: user.name,
    phone_number: user.phone_number,
  };
}

export function getCurrentUserProfile(token: string): Promise<UserProfile> {
  return requestUserProfile(token, 'GET');
}

export function updateCurrentUserProfile(
  token: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  return requestUserProfile(token, 'PUT', input);
}
