/**
 * @jest-environment node
 */

import fs from 'fs/promises';
import fsc from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';

const instancesRoot = path.join(
  os.tmpdir(),
  `palserver-remote-verify-${process.pid}`,
);

jest.mock('../main/constant', () => {
  const mockPath = require('path');
  const mockOs = require('os');
  const root = mockPath.join(
    mockOs.tmpdir(),
    `palserver-remote-verify-${process.pid}`,
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

import testRemoteConnection from '../main/services/remote/testRemoteConnection';
import readRemoteSettings from '../main/services/remote/readRemoteSettings';
import writeRemoteSettings from '../main/services/remote/writeRemoteSettings';
import { buildRemoteServerInstanceSetting } from '../main/services/remote/buildRemoteServerInstanceSetting';
import editRemoteServerInstance from '../main/services/remote/editRemoteServerInstance';
import { resolveAdminConnectionConfig } from '../main/services/admin/adminConnectionConfig';

function startMockRestServer({ password = 'admin-secret', status = 200 } = {}) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const auth = req.headers.authorization || '';
      const expected = `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`;

      if (req.url === '/v1/api/info' && auth === expected) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ version: 'v1.0.0.0', currentplayernum: 2 }));
        return;
      }

      if (req.url === '/v1/api/info' && auth !== expected) {
        res.writeHead(401);
        res.end();
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
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

describe('remote Tier 1 integration', () => {
  beforeAll(async () => {
    await fs.mkdir(instancesRoot, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(instancesRoot, { recursive: true, force: true });
  });

  it('writes metadata-only remote instance files and resolves admin host', async () => {
    const serverId = 'sr-integration';
    const { serverInstanceSetting, remoteSettings } =
      buildRemoteServerInstanceSetting(instancesRoot, serverId, {
        ServerName: 'Integration VPS',
        PublicIP: '203.0.113.55',
        RESTAPIPort: 18212,
        AdminPassword: 'secret',
      });

    const instancePath = path.join(instancesRoot, serverId);
    await fs.mkdir(instancePath, { recursive: true });
    await fs.writeFile(
      path.join(instancePath, '.pal'),
      JSON.stringify(serverInstanceSetting, null, 2),
    );
    await writeRemoteSettings(serverId, remoteSettings);

    expect(fsc.existsSync(path.join(instancePath, 'server'))).toBe(false);
    expect(fsc.existsSync(path.join(instancePath, 'remote-settings.json'))).toBe(
      true,
    );

    const loadedSettings = await readRemoteSettings(serverId);
    expect(loadedSettings.ServerName).toBe('Integration VPS');
    expect(loadedSettings.PublicIP).toBe('203.0.113.55');

    const connection = resolveAdminConnectionConfig(
      serverInstanceSetting,
      loadedSettings,
    );
    expect(connection).toEqual({
      host: '203.0.113.55',
      restPort: 18212,
      rconPort: 25575,
      adminPassword: 'secret',
    });
  });

  it('editRemoteServerInstance updates remote-settings.json and .pal metadata', async () => {
    const serverId = 'sr-edit-remote';
    const { serverInstanceSetting, remoteSettings } =
      buildRemoteServerInstanceSetting(instancesRoot, serverId, {
        ServerName: 'Before Edit',
        PublicIP: '203.0.113.10',
        RESTAPIPort: 8212,
        AdminPassword: 'old-secret',
      });

    const instancePath = path.join(instancesRoot, serverId);
    await fs.mkdir(instancePath, { recursive: true });
    await fs.writeFile(
      path.join(instancePath, '.pal'),
      JSON.stringify(serverInstanceSetting, null, 2),
    );
    await writeRemoteSettings(serverId, remoteSettings);

    await editRemoteServerInstance(serverId, {
      ServerName: 'After Edit',
      PublicIP: 'vps.example.com',
      RESTAPIPort: 18212,
      AdminPassword: 'new-secret',
    });

    const loadedSettings = await readRemoteSettings(serverId);
    expect(loadedSettings.ServerName).toBe('After Edit');
    expect(loadedSettings.PublicIP).toBe('vps.example.com');
    expect(loadedSettings.RESTAPIPort).toBe(18212);
    expect(loadedSettings.AdminPassword).toBe('new-secret');

    const updatedPal = JSON.parse(
      await fs.readFile(path.join(instancePath, '.pal'), 'utf-8'),
    );
    expect(updatedPal.remoteHost).toBe('vps.example.com');
    expect(updatedPal.remoteRestPort).toBe(18212);
    expect(updatedPal.editedAt).toBeTruthy();
  });

  it('testRemoteConnection succeeds against a mock REST server', async () => {
    const mock = await startMockRestServer({ password: 'pal-admin' });

    try {
      const result = await testRemoteConnection({
        host: '127.0.0.1',
        restPort: mock.port,
        adminPassword: 'pal-admin',
      });

      expect(result.ok).toBe(true);
      expect(result.info).toMatchObject({
        version: 'v1.0.0.0',
        currentplayernum: 2,
      });
    } finally {
      await mock.close();
    }
  });

  it('testRemoteConnection reports auth failures from mock REST server', async () => {
    const mock = await startMockRestServer({ password: 'correct-password' });

    try {
      const result = await testRemoteConnection({
        host: '127.0.0.1',
        restPort: mock.port,
        adminPassword: 'wrong-password',
      });

      expect(result.ok).toBe(false);
      expect(result.errorCode).toBe('AUTH_FAILED');
    } finally {
      await mock.close();
    }
  });

  it('local instances still resolve to localhost admin host', () => {
    expect(
      resolveAdminConnectionConfig(
        { isRemote: false },
        {
          RESTAPIPort: 8212,
          RCONPort: 25575,
          AdminPassword: '"local-secret"',
        },
      ),
    ).toEqual({
      host: '127.0.0.1',
      restPort: 8212,
      rconPort: 25575,
      adminPassword: 'local-secret',
    });
  });
});
