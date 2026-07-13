import { BrowserWindow } from 'electron';
import Channels from '../../ipcs/channels';

export function getMainWindowWebContents() {
  const window = BrowserWindow.getAllWindows()[0];
  return window?.webContents ?? null;
}

export function notifyServerStarted(
  serverId: string,
  processId: number,
  queryPort: number,
) {
  const webContents = getMainWindowWebContents();
  webContents?.send(
    Channels.execStartServerReply.DONE,
    serverId,
    processId,
    queryPort,
  );
}

export function notifyServerExited(serverId: string, processId: number) {
  const webContents = getMainWindowWebContents();
  webContents?.send(
    Channels.execStartServerReply.EXIT,
    serverId,
    processId,
  );
}
