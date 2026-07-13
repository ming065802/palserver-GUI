/**
 * Scheduled stop/start/restart service verification.
 * @jest-environment node
 */

import fs from 'fs/promises';
import fsc from 'fs';
import os from 'os';
import path from 'path';

const instancesRoot = path.join(
  os.tmpdir(),
  `palserver-schedule-${process.pid}`,
);

jest.mock('../main/constant', () => {
  const mockPath = require('path');
  const mockOs = require('os');
  const root = mockPath.join(
    mockOs.tmpdir(),
    `palserver-schedule-${process.pid}`,
  );

  return {
    USER_SERVER_INSTANCES_PATH: root,
    ENGINE_PATH: mockPath.join(root, 'engine'),
    APP_DATA_PATH: root,
    PROGRAM_APP_DATA_PATH: root,
    TEMPLATE_PATH: mockPath.join(root, 'template'),
    SERVER_TEMPLATE_PATH: mockPath.join(root, 'template', 'server'),
    STEAMCMD_PATH: mockPath.join(root, 'steamcmd'),
  };
});

jest.mock('../types/DailySchedule.types', () => {
  const actual = jest.requireActual('../types/DailySchedule.types');
  return {
    ...actual,
    getMsUntilNextOccurrence: jest.fn(() => 25),
  };
});

jest.mock('../main/services/serverInstanceSettings/getServerInfoByServerId');
jest.mock('../main/services/worldSettings/getWorldSettingsByServerId');
jest.mock('../main/services/admin/restAdmin', () => ({
  isRestApiEnabled: jest.fn(),
}));
jest.mock('../main/services/serverExec/gracefulShutdownServer', () => ({
  gracefulShutdownServer: jest.fn(),
}));
jest.mock('../main/services/serverExec/startLocalServer', () => ({
  startLocalServer: jest.fn(),
}));
jest.mock('../main/services/serverExec/runningServersRegistry', () => ({
  allocateQueryPort: jest.fn(() => 27015),
  getRunningServer: jest.fn(),
  isServerRunning: jest.fn(),
  registerRunningServer: jest.fn(),
  unregisterRunningServer: jest.fn(),
}));

import getServerInfoByServerId from '../main/services/serverInstanceSettings/getServerInfoByServerId';
import getWorldSettingsByServerId from '../main/services/worldSettings/getWorldSettingsByServerId';
import { isRestApiEnabled } from '../main/services/admin/restAdmin';
import { gracefulShutdownServer } from '../main/services/serverExec/gracefulShutdownServer';
import { startLocalServer } from '../main/services/serverExec/startLocalServer';
import {
  allocateQueryPort,
  getRunningServer,
  isServerRunning,
} from '../main/services/serverExec/runningServersRegistry';
import {
  initServerScheduleService,
  rescheduleServer,
  unscheduleServer,
} from '../main/services/scheduler/serverScheduleService';
import { USER_SERVER_INSTANCES_PATH } from '../main/constant';

const mockedGetServerInfoByServerId = getServerInfoByServerId;
const mockedGetWorldSettingsByServerId = getWorldSettingsByServerId;
const mockedIsRestApiEnabled = isRestApiEnabled;
const mockedGracefulShutdownServer = gracefulShutdownServer;
const mockedStartLocalServer = startLocalServer;
const mockedIsServerRunning = isServerRunning;
const mockedGetRunningServer = getRunningServer;

function buildLocalServerInfo(overrides = {}) {
  return {
    serverId: 'local-server',
    isRemote: false,
    scheduledStop: { enabled: false, time: '06:00', warningMinutes: 5 },
    scheduledStart: { enabled: false, time: '08:00', warningMinutes: 5 },
    scheduledRestart: { enabled: false, time: '04:00', warningMinutes: 5 },
    ...overrides,
  };
}

function buildRemoteServerInfo(overrides = {}) {
  return buildLocalServerInfo({
    serverId: 'remote-server',
    isRemote: true,
    remoteHost: '203.0.113.10',
    ...overrides,
  });
}

async function writeServerInstance(serverId, serverInfo) {
  const instancePath = path.join(USER_SERVER_INSTANCES_PATH, serverId);
  await fs.mkdir(instancePath, { recursive: true });
  await fs.writeFile(
    path.join(instancePath, '.pal'),
    JSON.stringify(serverInfo),
    'utf-8',
  );
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function triggerScheduleOnce(...serverIds) {
  await jest.advanceTimersByTimeAsync(30);
  await flushPromises();
  serverIds.forEach((serverId) => unscheduleServer(serverId));
}

async function triggerRestartScheduleOnce(serverId) {
  await jest.advanceTimersByTimeAsync(30);
  await jest.advanceTimersByTimeAsync(5000);
  await flushPromises();
  unscheduleServer(serverId);
}

describe('serverScheduleService', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    if (fsc.existsSync(USER_SERVER_INSTANCES_PATH)) {
      await fs.rm(USER_SERVER_INSTANCES_PATH, { recursive: true, force: true });
    }
    await fs.mkdir(USER_SERVER_INSTANCES_PATH, { recursive: true });

    mockedGetWorldSettingsByServerId.mockResolvedValue({
      RESTAPIEnabled: true,
      RCONEnabled: false,
    });
    mockedIsRestApiEnabled.mockReturnValue(true);
    mockedGracefulShutdownServer.mockResolvedValue(undefined);
    mockedStartLocalServer.mockResolvedValue(undefined);
    mockedIsServerRunning.mockReturnValue(false);
    mockedGetRunningServer.mockReturnValue(undefined);
  });

  afterEach(async () => {
    jest.useRealTimers();

    if (fsc.existsSync(USER_SERVER_INSTANCES_PATH)) {
      await fs.rm(USER_SERVER_INSTANCES_PATH, { recursive: true, force: true });
    }
  });

  it('executes scheduled stop for a running local server via REST shutdown', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildLocalServerInfo({
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 7 },
      }),
    );
    mockedIsServerRunning.mockReturnValue(true);

    await rescheduleServer('local-server');
    await triggerScheduleOnce('local-server');

    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('local-server', {
      waitMinutes: 7,
      message: 'Scheduled server shutdown',
    });
  });

  it('executes scheduled start for a stopped local server', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildLocalServerInfo({
        scheduledStart: { enabled: true, time: '08:00', warningMinutes: 5 },
      }),
    );
    mockedIsServerRunning.mockReturnValue(false);

    await rescheduleServer('local-server');
    await triggerScheduleOnce('local-server');

    expect(allocateQueryPort).toHaveBeenCalled();
    expect(mockedStartLocalServer).toHaveBeenCalledWith('local-server', 27015);
  });

  it('executes scheduled restart for a running local server', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildLocalServerInfo({
        scheduledRestart: { enabled: true, time: '04:00', warningMinutes: 3 },
      }),
    );
    mockedIsServerRunning.mockImplementation(() => {
      if (mockedIsServerRunning.mock.calls.length <= 1) {
        return true;
      }
      return false;
    });
    mockedGetRunningServer.mockReturnValue({
      processId: 4242,
      queryPort: 27020,
    });

    await rescheduleServer('local-server');
    await triggerRestartScheduleOnce('local-server');

    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('local-server', {
      waitMinutes: 3,
      message: 'Scheduled server restart',
    });
    expect(mockedStartLocalServer).toHaveBeenCalledWith('local-server', 27020);
  });

  it('does not register scheduled start for remote servers', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildRemoteServerInfo({
        scheduledStart: { enabled: true, time: '08:00', warningMinutes: 5 },
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
      }),
    );

    await rescheduleServer('remote-server');
    await triggerScheduleOnce('remote-server');

    expect(mockedStartLocalServer).not.toHaveBeenCalled();
    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('remote-server', {
      waitMinutes: 5,
      message: 'Scheduled server shutdown',
    });
    expect(mockedGracefulShutdownServer).toHaveBeenCalledTimes(1);
  });

  it('executes remote scheduled stop when admin API is available', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildRemoteServerInfo({
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
      }),
    );

    await rescheduleServer('remote-server');
    await triggerScheduleOnce('remote-server');

    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('remote-server', {
      waitMinutes: 5,
      message: 'Scheduled server shutdown',
    });
  });

  it('skips remote scheduled stop when admin API is unavailable', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildRemoteServerInfo({
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
      }),
    );
    mockedIsRestApiEnabled.mockReturnValue(false);
    mockedGetWorldSettingsByServerId.mockResolvedValue({
      RESTAPIEnabled: false,
      RCONEnabled: false,
    });

    await rescheduleServer('remote-server');
    await triggerScheduleOnce('remote-server');

    expect(mockedGracefulShutdownServer).not.toHaveBeenCalled();
  });

  it('clears timers when schedule is disabled or server is unscheduled', async () => {
    mockedGetServerInfoByServerId.mockResolvedValue(
      buildLocalServerInfo({
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
      }),
    );
    mockedIsServerRunning.mockReturnValue(true);

    await rescheduleServer('local-server');
    unscheduleServer('local-server');
    await jest.advanceTimersByTimeAsync(50);

    expect(mockedGracefulShutdownServer).not.toHaveBeenCalled();

    mockedGetServerInfoByServerId.mockResolvedValue(
      buildLocalServerInfo({
        scheduledStop: { enabled: false, time: '06:00', warningMinutes: 5 },
      }),
    );

    await rescheduleServer('local-server');
    await triggerScheduleOnce('local-server');

    expect(mockedGracefulShutdownServer).not.toHaveBeenCalled();
  });

  it('initializes schedules for all saved server instances on startup', async () => {
    await writeServerInstance(
      'boot-local',
      buildLocalServerInfo({
        serverId: 'boot-local',
        scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
      }),
    );
    await writeServerInstance(
      'boot-remote',
      buildRemoteServerInfo({
        serverId: 'boot-remote',
        scheduledRestart: { enabled: true, time: '04:00', warningMinutes: 5 },
      }),
    );

    mockedGetServerInfoByServerId.mockImplementation(async (serverId) => {
      if (serverId === 'boot-local') {
        return buildLocalServerInfo({
          serverId: 'boot-local',
          scheduledStop: { enabled: true, time: '06:00', warningMinutes: 5 },
        });
      }

      if (serverId === 'boot-remote') {
        return buildRemoteServerInfo({
          serverId: 'boot-remote',
          scheduledRestart: { enabled: true, time: '04:00', warningMinutes: 5 },
        });
      }

      return buildLocalServerInfo({ serverId });
    });
    mockedIsServerRunning.mockReturnValue(true);

    await initServerScheduleService();
    await triggerScheduleOnce('boot-local', 'boot-remote');

    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('boot-local', {
      waitMinutes: 5,
      message: 'Scheduled server shutdown',
    });
    expect(mockedGracefulShutdownServer).toHaveBeenCalledWith('boot-remote', {
      waitMinutes: 5,
      message: 'Scheduled server restart',
    });
  });
});
