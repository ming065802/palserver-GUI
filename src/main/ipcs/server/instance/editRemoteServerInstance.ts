import { ipcMain } from 'electron';
import Channels from '../../channels';
import editRemoteServerInstance from '../../../services/remote/editRemoteServerInstance';

ipcMain.handle(
  Channels.editRemoteServerInstance,
  async (event, serverId: string, input) => {
    return editRemoteServerInstance(serverId, input);
  },
);
