import { ApiError } from '@/services/auth-api';

export type NotificationCategory = 'FOOD' | 'DRINK';

type NotificationPreferencesResponse = {
  categories: NotificationCategory[];
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

const parsePreferences = (payload: unknown): NotificationPreferencesResponse => {
  if (
    !isRecord(payload) ||
    !Array.isArray(payload.categories) ||
    !payload.categories.every(
      (category) => category === 'FOOD' || category === 'DRINK',
    )
  ) {
    throw new Error('The notification preferences response from the server is invalid.');
  }

  return { categories: payload.categories };
};

async function requestPreferences(
  token: string,
  categories?: NotificationCategory[],
): Promise<NotificationPreferencesResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/notifications/preferences`,
    {
      method: categories ? 'PUT' : 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(categories ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(categories ? { body: JSON.stringify({ categories }) } : {}),
    },
  );
  const payload: unknown = await response.json();

  if (!response.ok) {
    const errorPayload =
      isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
    throw new ApiError(
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : 'Unable to update notification preferences.',
      response.status,
      typeof errorPayload?.code === 'string' ? errorPayload.code : undefined,
    );
  }

  return parsePreferences(payload);
}

export function getNotificationPreferences(
  token: string,
): Promise<NotificationPreferencesResponse> {
  return requestPreferences(token);
}

export function updateNotificationPreferences(
  token: string,
  categories: NotificationCategory[],
): Promise<NotificationPreferencesResponse> {
  return requestPreferences(token, categories);
}
