export const formatBaht = (amount: number) =>
  `฿${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const formatDistance = (meters: number) =>
  meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1).replace(/\.0$/, "")} km`;

export function formatTimeLeft(isoDate: string, now = Date.now()) {
  const minutes = Math.ceil((new Date(isoDate).getTime() - now) / 60_000);
  if (minutes <= 0) return "Ending";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function formatDealDate(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayDiff = Math.round(
    (new Date(date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  if (dayDiff === -1) return `Yesterday, ${time}`;
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  return `${day}, ${time}`;
}
