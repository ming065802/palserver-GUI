import { ipcMain } from 'electron';
import Channels from '../../channels';
import sendCommand from '../../../utils/rcon/sendCommand';
import getAdminConnectionConfig, {
  getRconOptions,
} from '../../../services/admin/getAdminHost';

ipcMain.handle(
  Channels.sendRCONCommand,
  async (event, serverId: string, command: string) => {
    try {
      const connection = await getAdminConnectionConfig(serverId);
      const response = await sendCommand(getRconOptions(connection), command);
      return response;
    } catch (e) {}
  },
);
