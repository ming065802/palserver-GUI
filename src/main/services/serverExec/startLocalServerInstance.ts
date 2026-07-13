import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import readWorldSettingsini from '../worldSettings/readWorldSettingsini';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import sleep from '../../../utils/sleep';
import sendCommand from '../../utils/rcon/sendCommand';
import {
  isRestApiEnabled,
  restGetInfo,
  restSave,
  restShutdown,
} from '../admin/restAdmin';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../admin/getAdminHost';
import {
  allocateQueryPort,
  getRunningServer,
} from './runningServersRegistry';
import {
  prepareLocalServer,
  spawnLocalServer,
} from './startLocalServer';

function registerAutoRestartWatcher(
  serverId: string,
  queryport: number,
  useIndependentProcess: boolean,
) {
  void (async () => {
    let serverInfo = await getServerInfoByServerId(serverId);
    const serverPath = path.join(USER_SERVER_INSTANCES_PATH, serverId, 'server');
    const worldSettingsPath = path.join(
      serverPath,
      'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
    );
    const worldSettings = await readWorldSettingsini(worldSettingsPath);
    const connection = await getAdminConnectionConfig(serverId);
    const restConfig = {
      host: connection.host,
      port: connection.restPort,
      password: connection.adminPassword,
    };
    const serverOptions = getRconOptions(connection);
    const isEnabledRCON = worldSettings.RCONEnabled;
    const useRestApi = isRestApiEnabled(worldSettings);

    if (!serverInfo.AutoRestart || !(useRestApi || isEnabledRCON)) {
      return;
    }

    const clearAutoRestart = setInterval(async () => {
      try {
        serverInfo = await getServerInfoByServerId(serverId);
        if (!serverInfo.AutoRestart) {
          clearInterval(clearAutoRestart);
        }
        if (useRestApi) {
          await restSave(restConfig);
          await restShutdown(restConfig, 60, 'Scheduled restart');
        } else {
          sendCommand(serverOptions, 'save');
          sendCommand(serverOptions, 'shutdown 1');
        }
        await sleep(5000);
        await spawnLocalServer(serverId, queryport, useIndependentProcess);
      } catch (e) {
        //
      }
    }, serverInfo.AutoRestart * 1000 * 60 * 60);
  })();
}

function registerCrashRestartWatcher(
  serverId: string,
  queryport: number,
  useIndependentProcess: boolean,
) {
  void (async () => {
    let serverInfo = await getServerInfoByServerId(serverId);
    const serverPath = path.join(USER_SERVER_INSTANCES_PATH, serverId, 'server');
    const worldSettingsPath = path.join(
      serverPath,
      'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
    );
    const worldSettings = await readWorldSettingsini(worldSettingsPath);
    const connection = await getAdminConnectionConfig(serverId);
    const restConfig = {
      host: connection.host,
      port: connection.restPort,
      password: connection.adminPassword,
    };
    const serverOptions = getRconOptions(connection);
    const isEnabledRCON = worldSettings.RCONEnabled;
    const useRestApi = isRestApiEnabled(worldSettings);

    if (!serverInfo.CrashRestart || !(useRestApi || isEnabledRCON)) {
      return;
    }

    const clearCrashRestart = setInterval(async () => {
      try {
        serverInfo = await getServerInfoByServerId(serverId);
        if (!serverInfo.CrashRestart) {
          clearInterval(clearCrashRestart);
        }
        try {
          if (useRestApi) {
            await restGetInfo(restConfig);
          } else {
            await sendCommand(serverOptions, 'info');
          }
        } catch (e) {
          const running = getRunningServer(serverId);
          if (!running) {
            await spawnLocalServer(serverId, queryport, useIndependentProcess);
          }
        }
      } catch (e) {
        //
      }
    }, 1000 * 5);
  })();
}

export async function startLocalServerInstance(
  serverId: string,
  queryPort?: number,
) {
  const serverInfo = await getServerInfoByServerId(serverId);
  const resolvedQueryPort = queryPort ?? allocateQueryPort();

  await prepareLocalServer(serverId);

  const processId = await spawnLocalServer(
    serverId,
    resolvedQueryPort,
    serverInfo.UseIndependentProcess,
  );

  registerAutoRestartWatcher(
    serverId,
    resolvedQueryPort,
    serverInfo.UseIndependentProcess,
  );
  registerCrashRestartWatcher(
    serverId,
    resolvedQueryPort,
    serverInfo.UseIndependentProcess,
  );

  return {
    processId,
    queryPort: resolvedQueryPort,
  };
}
