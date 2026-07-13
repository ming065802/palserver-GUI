import fs from 'fs/promises';
import fsc from 'fs';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import { RemoteSettings } from '../../../types/RemoteSettings.types';
import { getRemoteSettingsPath } from './remoteSettingsPath';

export default async function writeRemoteSettings(
  serverId: string,
  settings: RemoteSettings,
) {
  const instancePath = path.join(USER_SERVER_INSTANCES_PATH, serverId);
  const settingsPath = getRemoteSettingsPath(serverId);

  if (!fsc.existsSync(instancePath)) {
    await fs.mkdir(instancePath, { recursive: true });
  }

  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), {
    encoding: 'utf-8',
  });
}
