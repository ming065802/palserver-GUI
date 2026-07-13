import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';

export const REMOTE_SETTINGS_FILENAME = 'remote-settings.json';

export function getRemoteSettingsPath(serverId: string) {
  return path.join(USER_SERVER_INSTANCES_PATH, serverId, REMOTE_SETTINGS_FILENAME);
}
