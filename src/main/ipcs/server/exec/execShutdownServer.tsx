import { ipcMain } from 'electron';
import Channels from '../../channels';
import { gracefulShutdownServer } from '../../../services/serverExec/gracefulShutdownServer';
import { getRunningServer } from '../../../services/serverExec/runningServersRegistry';

ipcMain.on(Channels.execShutdownServer, async (event, serverId, processId) => {
  const running = getRunningServer(serverId);
  const resolvedProcessId = running?.processId ?? processId;

  try {
    await gracefulShutdownServer(serverId, {
      waitMinutes: 1,
      message: 'Server shutting down',
    });
  } catch (e) {
    if (resolvedProcessId) {
      try {
        process.kill(resolvedProcessId);
      } catch {
        //
      }
    }
  }
});
