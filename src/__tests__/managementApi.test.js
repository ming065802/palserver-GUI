/**
 * @jest-environment node
 */

jest.mock('../main/constant', () => ({
  APP_DATA_PATH: '/tmp/palserver-test',
  USER_SERVER_INSTANCES_PATH: '/tmp/palserver-test/instances',
  ENGINE_PATH: '/tmp/palserver-test/engine',
}));

import express from 'express';
import http from 'http';
import { registerManagementApiRoutes } from '../main/server/management-api/routes';
import { normalizeManagementApiConfig } from '../main/services/management-api/managementApiConfig';

jest.mock('../main/services/management-api/managementApiConfig', () => {
  const actual = jest.requireActual(
    '../main/services/management-api/managementApiConfig',
  );
  return {
    ...actual,
    readManagementApiConfig: jest.fn(() => ({
      enabled: true,
      port: 3435,
      bindAddress: '127.0.0.1',
      apiKey: 'test-secret-key',
    })),
  };
});

jest.mock('../main/services/management-api/serverLifecycle', () => ({
  getServerLifecycleStatus: jest.fn(),
  listServerLifecycleStatuses: jest.fn(),
  startManagedServer: jest.fn(),
  stopManagedServer: jest.fn(),
  restartManagedServer: jest.fn(),
  serverInstanceExists: jest.fn(),
  ManagementApiError: class ManagementApiError extends Error {
    constructor(statusCode, code, message) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

jest.mock('../main/services/management-api/serverRestProxy', () => ({
  getManagedServerPlayers: jest.fn(),
  announceManagedServer: jest.fn(),
}));

import {
  getServerLifecycleStatus,
  listServerLifecycleStatuses,
  restartManagedServer,
  startManagedServer,
  stopManagedServer,
  ManagementApiError,
} from '../main/services/management-api/serverLifecycle';
import {
  announceManagedServer,
  getManagedServerPlayers,
} from '../main/services/management-api/serverRestProxy';

const mockedGetStatus = getServerLifecycleStatus;
const mockedListStatuses = listServerLifecycleStatuses;
const mockedStart = startManagedServer;
const mockedStop = stopManagedServer;
const mockedRestart = restartManagedServer;
const mockedGetPlayers = getManagedServerPlayers;
const mockedAnnounce = announceManagedServer;

function createTestApp() {
  const app = express();
  app.use(express.json());
  registerManagementApiRoutes(app);
  return app;
}

function requestTestApp(app, method, route, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : undefined;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: route,
          method,
          headers: {
            ...(payload
              ? {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(payload),
                }
              : {}),
            ...headers,
          },
        },
        (response) => {
          let raw = '';

          response.on('data', (chunk) => {
            raw += chunk;
          });

          response.on('end', () => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve({
                status: response.statusCode,
                body: raw ? JSON.parse(raw) : {},
              });
            });
          });
        },
      );

      req.on('error', (error) => {
        server.close(() => reject(error));
      });

      if (payload) {
        req.write(payload);
      }

      req.end();
    });
  });
}

describe('management api routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns health without authentication', async () => {
    const app = createTestApp();
    const response = await requestTestApp(app, 'GET', '/api/health');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('rejects protected routes without api key', async () => {
    const app = createTestApp();
    const response = await requestTestApp(app, 'GET', '/api/servers');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('lists servers with a valid api key', async () => {
    mockedListStatuses.mockResolvedValue([
      {
        serverId: 'local-1',
        isRemote: false,
        running: true,
      },
    ]);

    const app = createTestApp();
    const response = await requestTestApp(app, 'GET', '/api/servers', null, {
      'X-API-Key': 'test-secret-key',
    });

    expect(response.status).toBe(200);
    expect(response.body.servers).toHaveLength(1);
  });

  it('starts a local server', async () => {
    mockedStart.mockResolvedValue({
      serverId: 'local-1',
      processId: 1234,
      queryPort: 27015,
      running: true,
    });

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'POST',
      '/api/servers/local-1/start',
      null,
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(200);
    expect(response.body.processId).toBe(1234);
    expect(mockedStart).toHaveBeenCalledWith('local-1');
  });

  it('returns 501 when starting a remote server', async () => {
    mockedStart.mockRejectedValue(
      new ManagementApiError(
        501,
        'REMOTE_START_NOT_SUPPORTED',
        'Remote server instances cannot be started from the management API',
      ),
    );

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'POST',
      '/api/servers/remote-1/start',
      null,
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(501);
    expect(response.body.code).toBe('REMOTE_START_NOT_SUPPORTED');
  });

  it('stops and restarts a server', async () => {
    mockedStop.mockResolvedValue({
      serverId: 'local-1',
      isRemote: false,
      running: false,
    });
    mockedRestart.mockResolvedValue({
      serverId: 'local-1',
      processId: 5678,
      queryPort: 27016,
      running: true,
    });

    const app = createTestApp();
    const stopResponse = await requestTestApp(
      app,
      'POST',
      '/api/servers/local-1/stop',
      { waitMinutes: 2, message: 'bye' },
      { Authorization: 'Bearer test-secret-key' },
    );
    const restartResponse = await requestTestApp(
      app,
      'POST',
      '/api/servers/local-1/restart',
      { waitMinutes: 1 },
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(stopResponse.status).toBe(200);
    expect(stopResponse.body.running).toBe(false);
    expect(mockedStop).toHaveBeenCalledWith('local-1', {
      waitMinutes: 2,
      message: 'bye',
    });

    expect(restartResponse.status).toBe(200);
    expect(restartResponse.body.processId).toBe(5678);
  });

  it('returns server status', async () => {
    mockedGetStatus.mockResolvedValue({
      serverId: 'local-1',
      isRemote: false,
      running: true,
      processId: 42,
    });

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'GET',
      '/api/servers/local-1/status',
      null,
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(200);
    expect(response.body.running).toBe(true);
    expect(mockedGetStatus).toHaveBeenCalledWith('local-1');
  });

  it('returns server players', async () => {
    mockedGetPlayers.mockResolvedValue({
      players: [{ name: 'Alice', level: 12, ping: 42 }],
    });

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'GET',
      '/api/servers/local-1/players',
      null,
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(200);
    expect(response.body.players).toHaveLength(1);
    expect(mockedGetPlayers).toHaveBeenCalledWith('local-1');
  });

  it('announces to a running server', async () => {
    mockedAnnounce.mockResolvedValue({
      serverId: 'local-1',
      message: 'Server maintenance in 5 minutes',
      announced: true,
    });

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'POST',
      '/api/servers/local-1/announce',
      { message: 'Server maintenance in 5 minutes' },
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(200);
    expect(response.body.announced).toBe(true);
    expect(mockedAnnounce).toHaveBeenCalledWith(
      'local-1',
      'Server maintenance in 5 minutes',
    );
  });

  it('returns 409 when players are requested for a stopped server', async () => {
    mockedGetPlayers.mockRejectedValue(
      new ManagementApiError(409, 'SERVER_NOT_RUNNING', 'Server is not running'),
    );

    const app = createTestApp();
    const response = await requestTestApp(
      app,
      'GET',
      '/api/servers/local-1/players',
      null,
      { Authorization: 'Bearer test-secret-key' },
    );

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('SERVER_NOT_RUNNING');
  });
});

describe('management api config normalization', () => {
  it('auto-generates api key when binding to non-localhost', () => {
    const normalized = normalizeManagementApiConfig({
      enabled: true,
      bindAddress: '0.0.0.0',
      apiKey: '',
    });

    expect(normalized.apiKey).toHaveLength(48);
    expect(normalized.port).toBe(3435);
  });
});
