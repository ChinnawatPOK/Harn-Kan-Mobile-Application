export type AuthResult = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};

export type RegisterInput = {
  fullName: string;
  phoneNumber: string;
  password: string;
  acceptedTerms: true;
};

export type LoginInput = {
  phoneNumber: string;
  password: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getApiBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Set EXPO_PUBLIC_API_BASE_URL to the Gateway address.');
  }
  return baseUrl;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

async function postAuthRequest<TInput>(
  endpoint: 'register' | 'login',
  input: TInput,
): Promise<AuthResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const errorPayload =
      isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
    throw new ApiError(
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : endpoint === 'register'
          ? 'Unable to create your account.'
          : 'Unable to log in.',
      response.status,
      typeof errorPayload?.code === 'string' ? errorPayload.code : undefined,
    );
  }

  if (
    !isRecord(payload) ||
    typeof payload.token !== 'string' ||
    !isRecord(payload.user) ||
    typeof payload.user.id !== 'string' ||
    typeof payload.user.name !== 'string'
  ) {
    throw new Error(`The ${endpoint} response from the server is invalid.`);
  }

  return {
    token: payload.token,
    user: {
      id: payload.user.id,
      name: payload.user.name,
    },
  };
}

export function registerAccount(input: RegisterInput): Promise<AuthResult> {
  return postAuthRequest('register', input);
}

export function loginAccount(input: LoginInput): Promise<AuthResult> {
  return postAuthRequest('login', input);
}
