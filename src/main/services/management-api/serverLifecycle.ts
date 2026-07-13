import path from 'path';
import fsc from 'fs';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import getAdminConnectionConfig from '../admin/getAdminHost';
import { restGetInfo } from '../admin/restAdmin';
import { gracefulShutdownServer } from '../serverExec/gracefulShutdownServer';
import {
  allocateQueryPort,
  getRunningServer,
  isServerRunning,
} from '../serverExec/runningServersRegistry';
import { startLocalServerInstance } from '../serverExec/startLocalServerInstance';
import sleep from '../../../utils/sleep';
import {
  ManagementApiErrorCode,
  ManagementApiServerStatus,
} from '../../../types/ManagementApi.types';

export class ManagementApiError extends Error {
  readonly statusCode: number;

  readonly code: ManagementApiErrorCode;

  constructor(
    statusCode: number,
    code: ManagementApiErrorCode,
    message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function getServerInstancePath(serverId: string) {
  return path.join(USER_SERVER_INSTANCES_PATH, serverId, '.pal');
}

export function serverInstanceExists(serverId: string) {
  return fsc.existsSync(getServerInstancePath(serverId));
}

async function assertServerExists(serverId: string) {
  if (!serverInstanceExists(serverId)) {
    throw new ManagementApiError(404, 'SERVER_NOT_FOUND', 'Server not found');
  }
}

export async function getServerLifecycleStatus(
  serverId: string,
): Promise<ManagementApiServerStatus> {
  await assertServerExists(serverId);

  const serverInfo = await getServerInfoByServerId(serverId);
  const runningServer = getRunningServer(serverId);
  const isRemote = Boolean(serverInfo.isRemote);
  let restReachable = false;

  if (isRemote) {
    try {
      const connection = await getAdminConnectionConfig(serverId);
      await restGetInfo({
        host: connection.host,
        port: connection.restPort,
        password: connection.adminPassword,
      });
      restReachable = true;
    } catch {
      restReachable = false;
    }

    return {
      serverId,
      isRemote: true,
      running: restReachable,
      serverName: serverInfo.serverId,
      restReachable,
    };
  }

  const processRunning = isServerRunning(serverId);

  if (processRunning) {
    try {
      const connection = await getAdminConnectionConfig(serverId);
      await restGetInfo({
        host: connection.host,
        port: connection.restPort,
        password: connection.adminPassword,
      });
      restReachable = true;
    } catch {
      restReachable = false;
    }
  }

  return {
    serverId,
    isRemote: false,
    running: processRunning,
    processId: runningServer?.processId,
    queryPort: runningServer?.queryPort,
    serverName: serverInfo.serverId,
    restReachable: processRunning ? restReachable : false,
  };
}

export async function listServerLifecycleStatuses() {
  if (!fsc.existsSync(USER_SERVER_INSTANCES_PATH)) {
    return [];
  }

  const serverIds = fsc
    .readdirSync(USER_SERVER_INSTANCES_PATH)
    .filter((serverId) => serverInstanceExists(serverId));

  return Promise.all(serverIds.map((serverId) => getServerLifecycleStatus(serverId)));
}

type LifecycleActionOptions = {
  waitMinutes?: number;
  message?: string;
};

export async function startManagedServer(serverId: string) {
  await assertServerExists(serverId);

  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    throw new ManagementApiError(
      501,
      'REMOTE_START_NOT_SUPPORTED',
      'Remote server instances cannot be started from the management API',
    );
  }

  if (isServerRunning(serverId)) {
    throw new ManagementApiError(
      409,
      'SERVER_ALREADY_RUNNING',
      'Server is already running',
    );
  }

  const queryPort = allocateQueryPort();
  const { processId, queryPort: resolvedQueryPort } =
    await startLocalServerInstance(serverId, queryPort);

  return {
    serverId,
    processId,
    queryPort: resolvedQueryPort,
    running: true,
  };
}

export async function stopManagedServer(
  serverId: string,
  options: LifecycleActionOptions = {},
) {
  await assertServerExists(serverId);

  const waitMinutes = options.waitMinutes ?? 1;
  const message = options.message ?? 'Server shutting down';

  await gracefulShutdownServer(serverId, { waitMinutes, message });

  return getServerLifecycleStatus(serverId);
}

export async function restartManagedServer(
  serverId: string,
  options: LifecycleActionOptions = {},
) {
  await assertServerExists(serverId);

  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    throw new ManagementApiError(
      501,
      'REMOTE_RESTART_NOT_SUPPORTED',
      'Remote server instances cannot be restarted from the management API',
    );
  }

  const running = getRunningServer(serverId);
  const queryPort = running?.queryPort ?? allocateQueryPort();

  if (isServerRunning(serverId)) {
    await gracefulShutdownServer(serverId, {
      waitMinutes: options.waitMinutes ?? 1,
      message: options.message ?? 'Server restarting',
    });
    await sleep(5000);
  }

  if (!isServerRunning(serverId)) {
    const { processId, queryPort: resolvedQueryPort } =
      await startLocalServerInstance(serverId, queryPort);
    return {
      serverId,
      processId,
      queryPort: resolvedQueryPort,
      running: true,
    };
  }

  const status = await getServerLifecycleStatus(serverId);
  return {
    serverId,
    processId: status.processId,
    queryPort: status.queryPort,
    running: status.running,
  };
}
