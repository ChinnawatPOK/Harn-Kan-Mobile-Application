export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  deals: {
    create: "/api/deals",
    nearby: "/api/deals/nearby",
    mine: "/api/deals/mine",
    byId: (dealId: string) => `/api/deals/${encodeURIComponent(dealId)}`,
    join: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/join`,
    leave: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/leave`,
    confirmReceipt: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/confirm-receipt`,
    receipt: (dealId: string) =>
      `/api/deals/${encodeURIComponent(dealId)}/receipt`,
  },
  notifications: {
    list: "/api/notifications",
    preferences: "/api/notifications/preferences",
    markRead: (notificationId: string) =>
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
  },
  payments: {
    pay: (paymentId: string) =>
      `/api/payments/${encodeURIComponent(paymentId)}/pay`,
    byId: (paymentId: string) =>
      `/api/payments/${encodeURIComponent(paymentId)}`,
  },
  users: {
    me: "/api/users/me",
    deactivate: "/api/users/me",
  },
} as const;
