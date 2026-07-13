import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import getWorldSettingsByServerId from '../worldSettings/getWorldSettingsByServerId';
import sendCommand from '../../utils/rcon/sendCommand';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../admin/getAdminHost';
import {
  isRestApiEnabled,
  restSave,
  restShutdown,
} from '../admin/restAdmin';
import { getRunningServer } from './runningServersRegistry';

export type GracefulShutdownOptions = {
  waitMinutes?: number;
  message?: string;
};

export async function gracefulShutdownServer(
  serverId: string,
  options: GracefulShutdownOptions = {},
) {
  const waitMinutes = options.waitMinutes ?? 1;
  const message = options.message ?? 'Server shutting down';
  const serverInfo = await getServerInfoByServerId(serverId);
  const worldSettings = await getWorldSettingsByServerId(serverId);
  const connection = await getAdminConnectionConfig(serverId);
  const restConfig = {
    host: connection.host,
    port: connection.restPort,
    password: connection.adminPassword,
  };
  const serverOptions = getRconOptions(connection);
  const useRestApi = isRestApiEnabled(worldSettings);
  const isEnabledRCON = worldSettings.RCONEnabled;
  const running = getRunningServer(serverId);

  if (serverInfo.isRemote) {
    if (useRestApi) {
      await restSave(restConfig);
      await restShutdown(restConfig, waitMinutes, message);
    }
    return;
  }

  if (useRestApi) {
    await restSave(restConfig);
    await restShutdown(restConfig, waitMinutes, message);
    return;
  }

  if (isEnabledRCON) {
    await sendCommand(serverOptions, 'save');
    await sendCommand(serverOptions, `shutdown ${waitMinutes}`);
    return;
  }

  if (running?.processId) {
    process.kill(running.processId);
  }
}
