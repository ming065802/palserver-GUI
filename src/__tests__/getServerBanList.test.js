/**
 * @jest-environment node
 */

import fs from 'fs/promises';
import fsc from 'fs';
import os from 'os';
import path from 'path';

const instancesRoot = path.join(
  os.tmpdir(),
  `palserver-banlist-test-${process.pid}`,
);

jest.mock('../main/constant', () => {
  const mockPath = require('path');
  const mockOs = require('os');
  const root = mockPath.join(
    mockOs.tmpdir(),
    `palserver-banlist-test-${process.pid}`,
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

import getServerBanList from '../main/services/ban/getServerBanList';

async function writeServerInstance(serverId, setting) {
  const instancePath = path.join(instancesRoot, serverId);
  await fs.mkdir(instancePath, { recursive: true });
  await fs.writeFile(
    path.join(instancePath, '.pal'),
    JSON.stringify(setting),
    'utf-8',
  );
}

describe('getServerBanList', () => {
  beforeEach(async () => {
    await fs.rm(instancesRoot, { recursive: true, force: true });
    await fs.mkdir(instancesRoot, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(instancesRoot, { recursive: true, force: true });
  });

  it('returns remoteLimited for remote instances without reading banlist.txt', async () => {
    const serverId = 'remote-server-1';

    await writeServerInstance(serverId, {
      serverId,
      isRemote: true,
      remoteHost: '203.0.113.10',
    });

    const result = await getServerBanList(serverId);

    expect(result).toEqual({
      bans: [],
      remoteLimited: true,
    });
  });

  it('reads local banlist.txt for non-remote instances', async () => {
    const serverId = 'local-server-1';

    await writeServerInstance(serverId, {
      serverId,
      isRemote: false,
    });

    const banListPath = path.join(
      instancesRoot,
      serverId,
      'server',
      'Pal/Saved/SaveGames',
    );
    await fs.mkdir(banListPath, { recursive: true });
    await fs.writeFile(
      path.join(banListPath, 'banlist.txt'),
      'steam_111\nsteam_222\n',
      'utf-8',
    );

    const result = await getServerBanList(serverId);

    expect(result).toEqual({
      bans: ['steam_111', 'steam_222'],
      remoteLimited: false,
    });
  });

  it('returns empty bans when local banlist.txt is missing', async () => {
    const serverId = 'local-server-2';

    await writeServerInstance(serverId, {
      serverId,
      isRemote: false,
    });

    const result = await getServerBanList(serverId);

    expect(result).toEqual({
      bans: [],
      remoteLimited: false,
    });
  });
});
