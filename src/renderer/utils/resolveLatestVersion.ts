import { isVersionOlder } from './versionToValue';

export default function resolveLatestVersion(
  remoteVersion: string | undefined,
  bundledVersion: string,
): string {
  const remote = remoteVersion?.trim();

  if (!remote) {
    return bundledVersion;
  }

  if (isVersionOlder(remote, bundledVersion)) {
    return bundledVersion;
  }

  return remote;
}
