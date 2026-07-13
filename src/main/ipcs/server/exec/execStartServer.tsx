/* eslint-disable no-use-before-define */
import { ipcMain } from 'electron';
import Channels from '../../channels';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../../constant';
import readWorldSettingsini from '../../../services/worldSettings/readWorldSettingsini';
import getServerInfoByServerId from '../../../services/serverInstanceSettings/getServerInfoByServerId';
import sleep from '../../../../utils/sleep';
import sendCommand from '../../../utils/rcon/sendCommand';
import {
  isRestApiEnabled,
  restGetInfo,
  restSave,
  restShutdown,
} from '../../../services/admin/restAdmin';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../../../services/admin/getAdminHost';
import {
  prepareLocalServer,
  spawnLocalServer,
} from '../../../services/serverExec/startLocalServer';
import { getRunningServer } from '../../../services/serverExec/runningServersRegistry';

ipcMain.on(
  Channels.execStartServer,
  async (event, serverId, queryport = 27015) => {
    const serverInfo = await getServerInfoByServerId(serverId);

    if (serverInfo.isRemote) {
      return;
    }

    await prepareLocalServer(serverId);

    const processId = await spawnLocalServer(
      serverId,
      queryport,
      serverInfo.UseIndependentProcess,
    );

    autoRestart(serverId, queryport, serverInfo.UseIndependentProcess);
    crashRestart(serverId, queryport, serverInfo.UseIndependentProcess);
  },
);

const autoRestart = async (
  serverId: string,
  queryport: number,
  useIndependentProcess: boolean,
) => {
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

  if (serverInfo.AutoRestart && (useRestApi || isEnabledRCON)) {
    const clearAutoRestart = setInterval(
      async () => {
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
      },
      serverInfo.AutoRestart * 1000 * 60 * 60,
    );
  }
};

const crashRestart = async (
  serverId: string,
  queryport: number,
  useIndependentProcess: boolean,
) => {
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

  if (serverInfo.CrashRestart && (useRestApi || isEnabledRCON)) {
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
  }
};
