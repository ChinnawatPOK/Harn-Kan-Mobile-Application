export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  notifications: {
    preferences: "/api/notifications/preferences",
  },
  users: {
    me: "/api/users/me",
  },
} as const;
