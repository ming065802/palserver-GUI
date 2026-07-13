/**
 * @jest-environment node
 *
 * Integration tests for the Management API HTTP server lifecycle.
 * Complements managementApi.test.js (route-level tests with mocked lifecycle).
 */

import fs from 'fs/promises';
import fsc from 'fs';
import http from 'http';
import path from 'path';

const APP_DATA = path.join('/tmp', `palserver-mgmt-api-${process.pid}`);

jest.mock('../main/constant', () => {
  const mockPath = require('path');
  const root = mockPath.join('/tmp', `palserver-mgmt-api-${process.pid}`);
  return {
    APP_DATA_PATH: root,
    USER_SERVER_INSTANCES_PATH: mockPath.join(root, 'instances'),
    ENGINE_PATH: mockPath.join(root, 'engine'),
  };
});

jest.mock('../main/services/management-api/serverLifecycle', () => ({
  getServerLifecycleStatus: jest.fn(),
  listServerLifecycleStatuses: jest.fn(async () => []),
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

let serverModule = null;
let testPortOffset = 0;

function getConfigPath() {
  return path.join(APP_DATA, 'management-api.config.json');
}

function pickTestPort() {
  testPortOffset += 1;
  return 35000 + (process.pid % 500) + testPortOffset;
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: raw ? JSON.parse(raw) : {},
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error(`Request timed out: ${url}`));
    });
  });
}

async function waitForRunning(isRunning, enabled, timeoutMs = 3000) {
  if (!enabled) {
    return;
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isRunning()) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  throw new Error('Management API server did not start in time');
}

async function bootServer(config) {
  jest.resetModules();
  await fs.writeFile(getConfigPath(), JSON.stringify(config));
  serverModule = await import('../main/server/management-api/server');
  await waitForRunning(
    () => serverModule.isManagementApiRunning(),
    config.enabled,
  );
  return serverModule;
}

describe('management api server integration', () => {
  beforeAll(async () => {
    await fs.mkdir(path.join(APP_DATA, 'instances'), { recursive: true });
  });

  afterEach(async () => {
    if (serverModule) {
      await serverModule.stopManagementApiServer();
      serverModule = null;
    }
    jest.resetModules();
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  afterAll(async () => {
    if (fsc.existsSync(APP_DATA)) {
      await fs.rm(APP_DATA, { recursive: true, force: true });
    }
  });

  it('starts HTTP server and serves /api/health when enabled', async () => {
    const port = pickTestPort();
    await bootServer({
      enabled: true,
      port,
      bindAddress: '127.0.0.1',
      apiKey: '',
    });

    expect(serverModule.isManagementApiRunning()).toBe(true);

    const response = await httpGet(`http://127.0.0.1:${port}/api/health`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      enabled: true,
      port,
      bindAddress: '127.0.0.1',
    });
  });

  it('does not listen when API is disabled', async () => {
    const port = pickTestPort();
    await bootServer({
      enabled: false,
      port,
      bindAddress: '127.0.0.1',
      apiKey: '',
    });

    expect(serverModule.isManagementApiRunning()).toBe(false);

    await expect(
      httpGet(`http://127.0.0.1:${port}/api/health`),
    ).rejects.toThrow();
  });

  it('requires API key on protected routes when configured', async () => {
    const port = pickTestPort();
    await bootServer({
      enabled: true,
      port,
      bindAddress: '127.0.0.1',
      apiKey: 'integration-test-key',
    });

    const unauthorized = await httpGet(`http://127.0.0.1:${port}/api/servers`);
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.body.code).toBe('UNAUTHORIZED');

    const authorized = await httpGet(`http://127.0.0.1:${port}/api/servers`, {
      Authorization: 'Bearer integration-test-key',
    });
    expect(authorized.status).toBe(200);
    expect(authorized.body.servers).toEqual([]);
  });
});
