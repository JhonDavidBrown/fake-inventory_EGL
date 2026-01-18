export function getSessionTokenClient(): string | undefined {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(^| )__session=([^;]+)/);
  return match?.[2];
}
