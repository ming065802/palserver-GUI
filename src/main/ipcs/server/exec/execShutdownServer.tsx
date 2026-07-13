import { ipcMain } from 'electron';
import Channels from '../../channels';
import getWorldSettingsByServerId from '../../../services/worldSettings/getWorldSettingsByServerId';
import sendCommand from '../../../utils/rcon/sendCommand';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../../../services/admin/getAdminHost';

ipcMain.on(Channels.execShutdownServer, async (event, serverId, processId) => {
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
