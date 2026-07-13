import fsc from 'fs';
import fs from 'fs/promises';
import { RemoteSettings } from '../../../types/RemoteSettings.types';
import { getRemoteSettingsPath } from './remoteSettingsPath';

export default async function readRemoteSettings(
  serverId: string,
): Promise<Partial<RemoteSettings>> {
  const settingsPath = getRemoteSettingsPath(serverId);

  if (!fsc.existsSync(settingsPath)) {
    return {};
  }

  const content = await fs.readFile(settingsPath, { encoding: 'utf-8' });
  return JSON.parse(content) as Partial<RemoteSettings>;
}
