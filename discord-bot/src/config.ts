import fs from 'fs';
import path from 'path';
import {
  DEFAULT_DISCORD_BOT_CONFIG,
  DiscordBotConfig,
} from './types';

function getConfigPath() {
  return path.join(__dirname, '..', 'config.json');
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeDiscordBotConfig(
  input: Partial<DiscordBotConfig> = {},
): DiscordBotConfig {
  const discordInput = (input.discord ?? {}) as Partial<
    DiscordBotConfig['discord']
  >;
  const managementApiInput = (input.managementApi ?? {}) as Partial<
    DiscordBotConfig['managementApi']
  >;

  return {
    enabled: Boolean(input.enabled),
    discord: {
      token:
        typeof discordInput.token === 'string' ? discordInput.token.trim() : '',
      clientId:
        typeof discordInput.clientId === 'string'
          ? discordInput.clientId.trim()
          : '',
      guildId:
        typeof discordInput.guildId === 'string'
          ? discordInput.guildId.trim()
          : '',
      allowedRoleIds: normalizeStringArray(discordInput.allowedRoleIds),
      allowedUserIds: normalizeStringArray(discordInput.allowedUserIds),
    },
    managementApi: {
      baseUrl:
        typeof managementApiInput.baseUrl === 'string' &&
        managementApiInput.baseUrl.trim()
          ? managementApiInput.baseUrl.trim().replace(/\/$/, '')
          : DEFAULT_DISCORD_BOT_CONFIG.managementApi.baseUrl,
      apiKey:
        typeof managementApiInput.apiKey === 'string'
          ? managementApiInput.apiKey.trim()
          : '',
    },
    defaultServerId:
      typeof input.defaultServerId === 'string'
        ? input.defaultServerId.trim()
        : '',
    dangerousCommandsRequireAdmin:
      input.dangerousCommandsRequireAdmin !== false,
  };
}

function applyEnvOverrides(config: DiscordBotConfig): DiscordBotConfig {
  const next = { ...config };

  if (process.env.DISCORD_BOT_TOKEN?.trim()) {
    next.discord = {
      ...next.discord,
      token: process.env.DISCORD_BOT_TOKEN.trim(),
    };
  }

  if (process.env.MANAGEMENT_API_URL?.trim()) {
    next.managementApi = {
      ...next.managementApi,
      baseUrl: process.env.MANAGEMENT_API_URL.trim().replace(/\/$/, ''),
    };
  }

  if (process.env.MANAGEMENT_API_KEY?.trim()) {
    next.managementApi = {
      ...next.managementApi,
      apiKey: process.env.MANAGEMENT_API_KEY.trim(),
    };
  }

  if (process.env.DEFAULT_SERVER_ID?.trim()) {
    next.defaultServerId = process.env.DEFAULT_SERVER_ID.trim();
  }

  return next;
}

export function loadConfig(): DiscordBotConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return applyEnvOverrides({ ...DEFAULT_DISCORD_BOT_CONFIG });
  }

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf-8' }));
    return applyEnvOverrides(normalizeDiscordBotConfig(raw));
  } catch {
    return applyEnvOverrides({ ...DEFAULT_DISCORD_BOT_CONFIG });
  }
}

export function resolveServerId(
  config: DiscordBotConfig,
  serverId?: string | null,
): string {
  const resolved = serverId?.trim() || config.defaultServerId;

  if (!resolved) {
    throw new UserFacingError(
      '請指定 serverId，或在設定中設定 defaultServerId。',
    );
  }

  return resolved;
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}
