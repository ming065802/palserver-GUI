import { ipcMain } from 'electron';
import Channels from '../channels';
import { readManagementApiConfig } from '../../services/management-api/managementApiConfig';

ipcMain.handle(Channels.getManagementApiConfig, async () => {
  return readManagementApiConfig();
});
