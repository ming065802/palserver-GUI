export default function normalizeRemoteUnbanUserId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  if (/^steam_/i.test(trimmed)) {
    return `steam_${trimmed.slice(6)}`;
  }

  return `steam_${trimmed}`;
}
