import { ipcMain } from 'electron';
import Channels from '../../channels';
import getServerInfoByServerId from '../../../services/serverInstanceSettings/getServerInfoByServerId';
import getWorldSettingsByServerId from '../../../services/worldSettings/getWorldSettingsByServerId';
import sendCommand from '../../../utils/rcon/sendCommand';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../../../services/admin/getAdminHost';
import {
  isRestApiEnabled,
  restSave,
  restShutdown,
} from '../../../services/admin/restAdmin';

ipcMain.on(Channels.execShutdownServer, async (event, serverId, processId) => {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    const connection = await getAdminConnectionConfig(serverId);
    const restConfig = {
      host: connection.host,
      port: connection.restPort,
      password: connection.adminPassword,
    };

    try {
      if (isRestApiEnabled(await getWorldSettingsByServerId(serverId))) {
        await restSave(restConfig);
        await restShutdown(restConfig, 1);
      }
    } catch (e) {
      //
    }

    return;
  }

  const worldSettings = await getWorldSettingsByServerId(serverId);
  const connection = await getAdminConnectionConfig(serverId);
  const serverOptions = getRconOptions(connection);
  const isEnabledRCON = worldSettings.RCONEnabled;

  try {
    // 存檔
    await sendCommand(serverOptions, 'save');
    if (isEnabledRCON) {
      // 執行 rcon 關閉伺服器
      await sendCommand(serverOptions, 'shutdown 1');
    } else {
      //
      process.kill(processId);
    }
  } catch (e) {
    process.kill(processId);
  }
});
