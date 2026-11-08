export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  deals: {
    root: "/api/deals",
    nearby: "/api/deals/nearby",
    mine: "/api/deals/mine",
    byId: (dealId: string) => `/api/deals/${encodeURIComponent(dealId)}`,
    join: (dealId: string) => `/api/deals/${encodeURIComponent(dealId)}/join`,
    leave: (dealId: string) => `/api/deals/${encodeURIComponent(dealId)}/leave`,
    confirmReceipt: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/confirm-receipt`,
    receipt: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/receipt`,
  },
  payments: {
    pay: (paymentId: string) =>
      `/api/payments/${encodeURIComponent(paymentId)}/pay`,
  },
  notifications: {
    list: "/api/notifications",
    preferences: "/api/notifications/preferences",
    markRead: (notificationId: string) =>
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    devices: "/api/notifications/devices",
    deviceByToken: (token: string) =>
      `/api/notifications/devices/${encodeURIComponent(token)}`,
  },
  users: {
    me: "/api/users/me",
    location: "/api/users/me/location",
    deactivate: "/api/users/me",
  },
} as const;
