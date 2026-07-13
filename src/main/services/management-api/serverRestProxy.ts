import getAdminConnectionConfig from '../admin/getAdminHost';
import {
  isRestApiEnabled,
  restAnnounce,
  restGetPlayers,
} from '../admin/restAdmin';
import getWorldSettingsByServerId from '../worldSettings/getWorldSettingsByServerId';
import {
  getServerLifecycleStatus,
  ManagementApiError,
  serverInstanceExists,
} from './serverLifecycle';

async function assertServerExists(serverId: string) {
  if (!serverInstanceExists(serverId)) {
    throw new ManagementApiError(404, 'SERVER_NOT_FOUND', 'Server not found');
  }
}

async function assertRestApiAvailable(serverId: string) {
  await assertServerExists(serverId);

  const status = await getServerLifecycleStatus(serverId);

  if (!status.running) {
    throw new ManagementApiError(
      409,
      'SERVER_NOT_RUNNING',
      'Server is not running',
    );
  }

  const worldSettings = await getWorldSettingsByServerId(serverId);

  if (!isRestApiEnabled(worldSettings)) {
    throw new ManagementApiError(
      503,
      'REST_API_DISABLED',
      'REST API is disabled for this server',
    );
  }

  return status;
}

export async function getManagedServerPlayers(serverId: string) {
  await assertRestApiAvailable(serverId);

  const connection = await getAdminConnectionConfig(serverId);

  try {
    return await restGetPlayers({
      host: connection.host,
      port: connection.restPort,
      password: connection.adminPassword,
    });
  } catch {
    throw new ManagementApiError(
      503,
      'REST_NOT_REACHABLE',
      'Unable to reach the Palworld REST API for this server',
    );
  }
}

export async function announceManagedServer(
  serverId: string,
  message: string,
) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new ManagementApiError(
      400,
      'INVALID_REQUEST',
      'Announcement message is required',
    );
  }

  await assertRestApiAvailable(serverId);

  const connection = await getAdminConnectionConfig(serverId);

  try {
    await restAnnounce(
      {
        host: connection.host,
        port: connection.restPort,
        password: connection.adminPassword,
      },
      trimmedMessage,
    );
  } catch {
    throw new ManagementApiError(
      503,
      'REST_NOT_REACHABLE',
      'Unable to reach the Palworld REST API for this server',
    );
  }

  return {
    serverId,
    message: trimmedMessage,
    announced: true,
  };
}
