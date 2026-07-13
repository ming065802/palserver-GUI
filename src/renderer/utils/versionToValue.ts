export default function versionToValue(version: string): string {
  if (!version) {
    return '';
  }

  return version
    .split('.')
    .map((segment) => segment.padStart(6, '0'))
    .join('.');
}

export function isVersionOlder(current: string, latest: string): boolean {
  if (!current) {
    return true;
  }

  return versionToValue(current) < versionToValue(latest);
}
