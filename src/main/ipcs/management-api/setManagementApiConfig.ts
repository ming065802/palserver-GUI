import { ipcMain } from 'electron';
import Channels from '../channels';
import {
  writeManagementApiConfig,
  generateManagementApiKey,
} from '../../services/management-api/managementApiConfig';
import { reloadManagementApiServer } from '../../server/management-api/server';
import { ManagementApiConfig } from '../../../types/ManagementApi.types';

ipcMain.handle(
  Channels.setManagementApiConfig,
  async (_event, config: Partial<ManagementApiConfig>) => {
    const nextConfig = await writeManagementApiConfig(config);
    await reloadManagementApiServer();
    return nextConfig;
  },
);

ipcMain.handle(Channels.generateManagementApiKey, async () => {
  return generateManagementApiKey();
});
