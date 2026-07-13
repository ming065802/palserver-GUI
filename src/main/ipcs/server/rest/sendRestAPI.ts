import { ipcMain } from 'electron';
import Channels from '../../channels';
import axios from 'axios';
import getAdminConnectionConfig from '../../../services/admin/getAdminHost';

ipcMain.handle(
  Channels.sendRestAPI,
  async (
    event,
    serverId: string,
    api: string,
    options?: { body: any; method: string },
  ) => {
    const { host, restPort, adminPassword } =
      await getAdminConnectionConfig(serverId);

    const result = await axios(`http://${host}:${restPort}/v1/api${api}`, {
      method: options?.method || 'get',
      auth: {
        username: 'admin',
        password: adminPassword,
      },
      data: options?.body,
    });

    return result.data;
  },
);
