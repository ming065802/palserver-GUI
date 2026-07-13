import { ipcMain } from 'electron';
import Channels from '../../channels';
import getServerInfoByServerId from '../../../services/serverInstanceSettings/getServerInfoByServerId';
import { startLocalServerInstance } from '../../../services/serverExec/startLocalServerInstance';

ipcMain.on(
  Channels.execStartServer,
  async (event, serverId, queryport = 27015) => {
    const serverInfo = await getServerInfoByServerId(serverId);

    if (serverInfo.isRemote) {
      return;
    }

    await startLocalServerInstance(serverId, queryport);
  },
);
