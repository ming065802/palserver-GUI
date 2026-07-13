import { ipcMain } from 'electron';
import Channels from '../../channels';
import getServerBanList from '../../../services/ban/getServerBanList';

ipcMain.handle(Channels.getServerBanList, async (event, serverId: string) => {
  return getServerBanList(serverId);
});
