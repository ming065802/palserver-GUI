/**
 * @jest-environment node
 */

import axios from 'axios';
import express from 'express';
import http from 'http';
import { registerOnlineMapRoutes } from '../main/server/server-online-map/onlineMapRoutes';

jest.mock('axios');
jest.mock('../main/services/admin/getAdminHost', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getAdminConnectionConfig from '../main/services/admin/getAdminHost';

const mockedAxios = axios;
const mockedGetAdminConnectionConfig = getAdminConnectionConfig;

function createTestApp() {
  const app = express();
  registerOnlineMapRoutes(app);
  return app;
}

function requestTestApp(app, path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();

      http
        .get(`http://127.0.0.1:${port}${path}`, (response) => {
          let body = '';

          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve({
                status: response.statusCode,
                body: body ? JSON.parse(body) : {},
              });
            });
          });
        })
        .on('error', (error) => {
          server.close(() => {
            reject(error);
          });
        });
    });
  });
}

describe('remote online map proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAdminConnectionConfig.mockResolvedValue({
      host: '203.0.113.55',
      restPort: 18212,
      rconPort: 25575,
      adminPassword: 'remote-secret',
    });
  });

  it('forwards /players to the remote REST host', async () => {
    mockedAxios.mockResolvedValue({
      data: { players: [{ name: 'Alice', playerId: 'steam_1' }] },
    });

    const app = createTestApp();
    const response = await requestTestApp(app, '/sr-remote-1/players');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      players: [{ name: 'Alice', playerId: 'steam_1' }],
    });
    expect(mockedGetAdminConnectionConfig).toHaveBeenCalledWith('sr-remote-1');
    expect(mockedAxios).toHaveBeenCalledWith(
      'http://203.0.113.55:18212/v1/api/players',
      {
        method: 'get',
        auth: {
          username: 'admin',
          password: 'remote-secret',
        },
      },
    );
  });

  it('forwards /info to the remote REST host', async () => {
    mockedAxios.mockResolvedValue({
      data: { version: 'v1.0.0.0', currentplayernum: 3 },
    });

    const app = createTestApp();
    const response = await requestTestApp(app, '/sr-remote-1/info');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      version: 'v1.0.0.0',
      currentplayernum: 3,
    });
    expect(mockedAxios).toHaveBeenCalledWith(
      'http://203.0.113.55:18212/v1/api/info',
      {
        method: 'get',
        auth: {
          username: 'admin',
          password: 'remote-secret',
        },
      },
    );
  });

  it('returns an empty object when the remote REST call fails', async () => {
    mockedAxios.mockRejectedValue(new Error('ECONNREFUSED'));

    const app = createTestApp();
    const response = await requestTestApp(app, '/sr-remote-1/players');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });
});
