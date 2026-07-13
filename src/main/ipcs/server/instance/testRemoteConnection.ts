import { ipcMain } from 'electron';
import Channels from '../../channels';
import testRemoteConnection from '../../../services/remote/testRemoteConnection';
import { RemoteConnectionTestInput } from '../../../../types/RemoteConnection.types';

ipcMain.handle(
  Channels.testRemoteConnection,
  async (event, input: RemoteConnectionTestInput) => {
    return testRemoteConnection(input);
  },
);
