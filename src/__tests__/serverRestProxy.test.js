/**
 * @jest-environment node
 */

jest.mock('../main/constant', () => ({
  APP_DATA_PATH: '/tmp/palserver-test',
  USER_SERVER_INSTANCES_PATH: '/tmp/palserver-test/instances',
  ENGINE_PATH: '/tmp/palserver-test/engine',
}));

jest.mock('../main/services/management-api/serverLifecycle', () => ({
  getServerLifecycleStatus: jest.fn(),
  serverInstanceExists: jest.fn(),
  ManagementApiError: class ManagementApiError extends Error {
    constructor(statusCode, code, message) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

jest.mock('../main/services/admin/getAdminHost', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../main/services/worldSettings/getWorldSettingsByServerId', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../main/services/admin/restAdmin', () => ({
  isRestApiEnabled: jest.fn(),
  restGetPlayers: jest.fn(),
  restAnnounce: jest.fn(),
}));

import getAdminConnectionConfig from '../main/services/admin/getAdminHost';
import {
  isRestApiEnabled,
  restAnnounce,
  restGetPlayers,
} from '../main/services/admin/restAdmin';
import {
  getServerLifecycleStatus,
  serverInstanceExists,
  ManagementApiError,
} from '../main/services/management-api/serverLifecycle';
import {
  announceManagedServer,
  getManagedServerPlayers,
} from '../main/services/management-api/serverRestProxy';
import getWorldSettingsByServerId from '../main/services/worldSettings/getWorldSettingsByServerId';

const mockedServerExists = serverInstanceExists;
const mockedGetStatus = getServerLifecycleStatus;
const mockedGetAdminConfig = getAdminConnectionConfig;
const mockedGetWorldSettings = getWorldSettingsByServerId;
const mockedIsRestApiEnabled = isRestApiEnabled;
const mockedRestGetPlayers = restGetPlayers;
const mockedRestAnnounce = restAnnounce;

describe('serverRestProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedServerExists.mockReturnValue(true);
    mockedGetStatus.mockResolvedValue({
      serverId: 'local-1',
      isRemote: false,
      running: true,
      restReachable: true,
    });
    mockedGetWorldSettings.mockResolvedValue({ RESTAPIEnabled: true });
    mockedIsRestApiEnabled.mockReturnValue(true);
    mockedGetAdminConfig.mockResolvedValue({
      host: '127.0.0.1',
      restPort: 8212,
      adminPassword: 'secret',
    });
  });

  it('returns players from the Palworld REST API', async () => {
    mockedRestGetPlayers.mockResolvedValue({
      players: [{ name: 'Alice', level: 8 }],
    });

    const result = await getManagedServerPlayers('local-1');

    expect(result.players).toHaveLength(1);
    expect(mockedRestGetPlayers).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 8212,
      password: 'secret',
    });
  });

  it('rejects players when the server is not running', async () => {
    mockedGetStatus.mockResolvedValue({
      serverId: 'local-1',
      isRemote: false,
      running: false,
    });

    await expect(getManagedServerPlayers('local-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'SERVER_NOT_RUNNING',
    });
  });

  it('rejects announce when REST API is disabled', async () => {
    mockedIsRestApiEnabled.mockReturnValue(false);

    await expect(
      announceManagedServer('local-1', 'hello'),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: 'REST_API_DISABLED',
    });
  });

  it('announces through the Palworld REST API', async () => {
    mockedRestAnnounce.mockResolvedValue({});

    const result = await announceManagedServer('local-1', 'Maintenance soon');

    expect(result).toEqual({
      serverId: 'local-1',
      message: 'Maintenance soon',
      announced: true,
    });
    expect(mockedRestAnnounce).toHaveBeenCalledWith(
      {
        host: '127.0.0.1',
        port: 8212,
        password: 'secret',
      },
      'Maintenance soon',
    );
  });

  it('rejects empty announce messages', async () => {
    await expect(announceManagedServer('local-1', '   ')).rejects.toBeInstanceOf(
      ManagementApiError,
    );
  });
});
