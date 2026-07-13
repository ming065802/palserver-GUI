import { ipcMain } from 'electron';
import Channels from '../../channels';
import createRemoteServerInstance from '../../../services/remote/createRemoteServerInstance';
import { CreateRemoteServerInstanceInput } from '../../../../types/RemoteConnection.types';

ipcMain.handle(
  Channels.createRemoteServerInstance,
  async (event, input: CreateRemoteServerInstanceInput) => {
    return createRemoteServerInstance(input);
  },
);
