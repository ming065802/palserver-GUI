import express from 'express';
import type { Server } from 'http';
import { readManagementApiConfig } from '../../services/management-api/managementApiConfig';
import { registerManagementApiRoutes } from './routes';

let managementApiServer: Server | null = null;

export function isManagementApiRunning() {
  return managementApiServer !== null;
}

export async function stopManagementApiServer() {
  if (!managementApiServer) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    managementApiServer?.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  managementApiServer = null;
}

export async function startManagementApiServer() {
  await stopManagementApiServer();

  const config = readManagementApiConfig();
  if (!config.enabled) {
    return null;
  }

  const app = express();
  app.use(express.json());
  registerManagementApiRoutes(app);

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(config.port, config.bindAddress, () => {
      managementApiServer = server;
      resolve(server);
    });

    server.on('error', (error) => {
      managementApiServer = null;
      reject(error);
    });
  });
}

export async function reloadManagementApiServer() {
  return startManagementApiServer();
}

void startManagementApiServer();
