/**
 * @jest-environment node
 */

import {
  ManagementApiClientError,
  createManagementApiClient,
  formatManagementApiError,
} from '../../discord-bot/src/api/managementApiClient';
import { assertCanManage } from '../../discord-bot/src/auth/assertAllowed';
import { UserFacingError } from '../../discord-bot/src/config';
import { formatStatusEmbed } from '../../discord-bot/src/utils/formatStatusEmbed';

const apiOptions = {
  baseUrl: 'http://127.0.0.1:3435',
  apiKey: 'test-key',
};

describe('discord-bot managementApiClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sends bearer token on protected requests', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ servers: [] }),
    });

    const client = createManagementApiClient(apiOptions);
    await client.listServers();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3435/api/servers',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );
  });

  it('formats remote start 501 errors', () => {
    const error = new ManagementApiClientError(
      501,
      'Remote server instances cannot be started from the management API',
      'REMOTE_START_NOT_SUPPORTED',
    );

    expect(formatManagementApiError(error)).toContain('遠端伺服器實例');
  });

  it('formats connection errors', () => {
    const error = new ManagementApiClientError(0, '無法連線至 Management API');
    expect(formatManagementApiError(error)).toContain('Management API');
  });
});

describe('discord-bot assertCanManage', () => {
  const baseConfig = {
    enabled: true,
    discord: {
      token: 'token',
      clientId: 'client',
      guildId: 'guild',
      allowedRoleIds: ['role-admin'],
      allowedUserIds: ['user-admin'],
    },
    managementApi: {
      baseUrl: 'http://127.0.0.1:3435',
      apiKey: '',
    },
    defaultServerId: 'server-1',
    dangerousCommandsRequireAdmin: true,
  };

  it('allows configured user ids', () => {
    expect(() =>
      assertCanManage(
        {
          user: { id: 'user-admin' },
          member: null,
        } as any,
        baseConfig,
      ),
    ).not.toThrow();
  });

  it('denies users without permission', () => {
    expect(() =>
      assertCanManage(
        {
          user: { id: 'user-guest' },
          member: {
            roles: {
              cache: {
                some: () => false,
              },
            },
          },
        } as any,
        baseConfig,
      ),
    ).toThrow(UserFacingError);
  });

  it('allows configured role ids', () => {
    expect(() =>
      assertCanManage(
        {
          user: { id: 'user-guest' },
          member: {
            roles: {
              cache: {
                some: (predicate: (role: { id: string }) => boolean) =>
                  predicate({ id: 'role-admin' }),
              },
            },
          },
        } as any,
        baseConfig,
      ),
    ).not.toThrow();
  });
});

describe('discord-bot formatStatusEmbed', () => {
  it('includes server status fields', () => {
    const embed = formatStatusEmbed({
      serverId: 'demo',
      isRemote: false,
      running: true,
      processId: 1234,
      queryPort: 8211,
      serverName: 'demo',
      restReachable: true,
    });

    expect(embed.data.title).toContain('demo');
    expect(embed.data.fields?.some((field) => field.name === '運行中')).toBe(
      true,
    );
  });
});
