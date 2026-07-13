/**
 * Tier 2 end-to-end integration: online map proxy, REST settings read, manual unban.
 * @jest-environment node
 */

import fs from 'fs/promises';
import fsc from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import axios from 'axios';
import express from 'express';
import sampleSettings from './fixtures/rest-settings-sample.json';
import { registerOnlineMapRoutes } from '../main/server/server-online-map/onlineMapRoutes';
import normalizeRestSettingsResponse from '../main/services/remote/normalizeRestSettingsResponse';
import { restGetSettings, restUnban } from '../main/services/admin/restAdmin';
import getServerBanList from '../main/services/ban/getServerBanList';
import { worldSettingsOptions } from '../renderer/components/WorldSettings/settings';

const instancesRoot = path.join(
  os.tmpdir(),
  `palserver-remote-tier2-${process.pid}`,
);

jest.mock('../main/constant', () => {
  const mockPath = require('path');
  const mockOs = require('os');
  const root = mockPath.join(
    mockOs.tmpdir(),
    `palserver-remote-tier2-${process.pid}`,
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

jest.mock('../main/services/admin/getAdminHost', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getAdminConnectionConfig from '../main/services/admin/getAdminHost';
import { buildRemoteServerInstanceSetting } from '../main/services/remote/buildRemoteServerInstanceSetting';
import writeRemoteSettings from '../main/services/remote/writeRemoteSettings';

const mockedGetAdminConnectionConfig = getAdminConnectionConfig;

function startTier2MockRestServer({ password = 'tier2-secret' } = {}) {
  const unbannedIds = [];

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const auth = req.headers.authorization || '';
      const expected = `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`;
      const authorized = auth === expected;

      if (!authorized) {
        res.writeHead(401);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/v1/api/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ version: 'v1.0.0.0', currentplayernum: 2 }),
        );
        return;
      }

      if (req.method === 'GET' && req.url === '/v1/api/players') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            players: [
              {
                name: 'Alice',
                playerId: 'steam_76561198123456789',
                location_x: 1200,
                location_y: 3400,
              },
            ],
          }),
        );
        return;
      }

      if (req.method === 'GET' && req.url === '/v1/api/settings') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sampleSettings));
        return;
      }

      if (req.method === 'POST' && req.url === '/v1/api/unban') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          const parsed = JSON.parse(body || '{}');
          unbannedIds.push(parsed.userid);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
        getUnbannedIds: () => [...unbannedIds],
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) closeReject(error);
              else closeResolve(undefined);
            });
          }),
      });
    });
  });
}

function requestOnlineMapProxy(pathSuffix) {
  return new Promise((resolve, reject) => {
    const app = express();
    registerOnlineMapRoutes(app);
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      http
        .get(`http://127.0.0.1:${port}${pathSuffix}`, (response) => {
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
          server.close(() => reject(error));
        });
    });
  });
}

describe('remote Tier 2 integration', () => {
  let mockServer;
  const serverId = 'sr-tier2-integration';
  const adminPassword = 'tier2-secret';

  beforeAll(async () => {
    await fs.mkdir(instancesRoot, { recursive: true });

    const { serverInstanceSetting, remoteSettings } =
      buildRemoteServerInstanceSetting(instancesRoot, serverId, {
        ServerName: 'Tier 2 Integration',
        PublicIP: '127.0.0.1',
        RESTAPIPort: 0,
        AdminPassword: adminPassword,
      });

    const instancePath = path.join(instancesRoot, serverId);
    await fs.mkdir(instancePath, { recursive: true });
    await fs.writeFile(
      path.join(instancePath, '.pal'),
      JSON.stringify(serverInstanceSetting, null, 2),
    );
    await writeRemoteSettings(serverId, remoteSettings);

    mockServer = await startTier2MockRestServer({ password: adminPassword });
    remoteSettings.RESTAPIPort = mockServer.port;
    await writeRemoteSettings(serverId, remoteSettings);

    mockedGetAdminConnectionConfig.mockResolvedValue({
      host: '127.0.0.1',
      restPort: mockServer.port,
      rconPort: 25575,
      adminPassword,
    });
  });

  afterAll(async () => {
    if (mockServer) {
      await mockServer.close();
    }
    await fs.rm(instancesRoot, { recursive: true, force: true });
  });

  describe('Phase 1 — remote online map', () => {
    it('proxies /players from remote REST for map markers', async () => {
      const response = await requestOnlineMapProxy(`/${serverId}/players`);

      expect(response.status).toBe(200);
      expect(response.body.players).toHaveLength(1);
      expect(response.body.players[0]).toMatchObject({
        name: 'Alice',
        playerId: 'steam_76561198123456789',
      });
    });

    it('proxies /info from remote REST for map header', async () => {
      const response = await requestOnlineMapProxy(`/${serverId}/info`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        version: 'v1.0.0.0',
        currentplayernum: 2,
      });
    });

    it('defaults OnlineMapEnabled for new remote instances', () => {
      const { serverInstanceSetting } = buildRemoteServerInstanceSetting(
        instancesRoot,
        'sr-map-check',
        {
          ServerName: 'Map Check',
          PublicIP: '203.0.113.1',
          RESTAPIPort: 8212,
          AdminPassword: 'secret',
        },
      );

      expect(serverInstanceSetting.OnlineMapEnabled).toBe(true);
      expect(serverInstanceSetting.isRemote).toBe(true);
    });
  });

  describe('Phase 2 — remote world settings read-only', () => {
    it('fetches settings via GET /v1/api/settings', async () => {
      const raw = await restGetSettings({
        host: '127.0.0.1',
        port: mockServer.port,
        password: adminPassword,
      });

      expect(raw.ServerName).toBe('Tier 2 Test Server');
      expect(raw.RESTAPIEnabled).toBe(true);
    });

    it('normalizes REST settings for GUI read-only display', () => {
      const knownKeys = new Set(Object.keys(worldSettingsOptions));
      const { settings, unknownKeys } = normalizeRestSettingsResponse(
        sampleSettings,
        knownKeys,
      );

      expect(settings.ExpRate).toBe(1.5);
      expect(settings.CrossplayPlatforms).toBe('(Steam,Xbox,PS5,Mac)');
      expect(settings.bIsPvP).toBe(false);
      expect(unknownKeys).toContain('CustomFutureField');
    });
  });

  describe('Phase 3 — remote manual unban', () => {
    it('posts userid to POST /v1/api/unban', async () => {
      const userId = 'steam_76561198987654321';
      await restUnban(
        {
          host: '127.0.0.1',
          port: mockServer.port,
          password: adminPassword,
        },
        userId,
      );

      expect(mockServer.getUnbannedIds()).toContain(userId);
    });

    it('returns remoteLimited for ban list on remote instances', async () => {
      const result = await getServerBanList(serverId);

      expect(result.bans).toEqual([]);
      expect(result.remoteLimited).toBe(true);
    });
  });

  describe('Tier 2 error handling', () => {
    it('rejects settings fetch with wrong admin password', async () => {
      await expect(
        restGetSettings({
          host: '127.0.0.1',
          port: mockServer.port,
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('returns empty map payload when remote REST is unreachable', async () => {
      mockedGetAdminConnectionConfig.mockResolvedValueOnce({
        host: '127.0.0.1',
        restPort: 59999,
        rconPort: 25575,
        adminPassword,
      });

      const response = await requestOnlineMapProxy(`/${serverId}/players`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });
});
