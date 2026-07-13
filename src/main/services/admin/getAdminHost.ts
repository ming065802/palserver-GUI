import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import getWorldSettingsByServerId from '../worldSettings/getWorldSettingsByServerId';
import {
  AdminConnectionConfig,
  resolveAdminConnectionConfig,
} from './adminConnectionConfig';

export {
  LOCALHOST,
  DEFAULT_REST_PORT,
  DEFAULT_RCON_PORT,
  resolveAdminConnectionConfig,
  getRconOptions,
} from './adminConnectionConfig';
export type { AdminConnectionConfig } from './adminConnectionConfig';

export default async function getAdminConnectionConfig(
  serverId: string,
): Promise<AdminConnectionConfig> {
  const serverInfo = await getServerInfoByServerId(serverId);
  const worldSettings = await getWorldSettingsByServerId(serverId);

  return resolveAdminConnectionConfig(serverInfo, worldSettings);
}
