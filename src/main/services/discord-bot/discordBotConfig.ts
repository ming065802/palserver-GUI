import fsc from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import {
  DEFAULT_DISCORD_BOT_CONFIG,
  DiscordBotConfig,
} from '../../../types/DiscordBot.types';
import { readManagementApiConfig } from '../management-api/managementApiConfig';

export const DISCORD_BOT_CONFIG_FILENAME = 'config.json';

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getDiscordBotDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'discord-bot');
  }

  return path.join(app.getAppPath(), 'discord-bot');
}

export function getDiscordBotConfigPath() {
  return path.join(getDiscordBotDir(), DISCORD_BOT_CONFIG_FILENAME);
}

export function normalizeDiscordBotConfig(
  input: Partial<DiscordBotConfig> = {},
): DiscordBotConfig {
  const discordInput = input.discord ?? {};
  const managementApiInput = input.managementApi ?? {};

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

function syncManagementApiSettings(
  config: DiscordBotConfig,
): DiscordBotConfig {
  const managementApiConfig = readManagementApiConfig();
  const baseUrl = `http://${managementApiConfig.bindAddress}:${managementApiConfig.port}`;

  return {
    ...config,
    managementApi: {
      baseUrl,
      apiKey:
        managementApiConfig.bindAddress !== '127.0.0.1'
          ? managementApiConfig.apiKey
          : config.managementApi.apiKey || managementApiConfig.apiKey,
    },
  };
}

export function readDiscordBotConfig(): DiscordBotConfig {
  const configPath = getDiscordBotConfigPath();

  if (!fsc.existsSync(configPath)) {
    return syncManagementApiSettings({ ...DEFAULT_DISCORD_BOT_CONFIG });
  }

  try {
    const content = fsc.readFileSync(configPath, { encoding: 'utf-8' });
    return syncManagementApiSettings(
      normalizeDiscordBotConfig(JSON.parse(content)),
    );
  } catch {
    return syncManagementApiSettings({ ...DEFAULT_DISCORD_BOT_CONFIG });
  }
}

export async function writeDiscordBotConfig(
  config: Partial<DiscordBotConfig>,
): Promise<DiscordBotConfig> {
  const normalized = syncManagementApiSettings(
    normalizeDiscordBotConfig({
      ...readDiscordBotConfig(),
      ...config,
      discord: {
        ...readDiscordBotConfig().discord,
        ...config.discord,
      },
      managementApi: {
        ...readDiscordBotConfig().managementApi,
        ...config.managementApi,
      },
    }),
  );

  const botDir = getDiscordBotDir();
  await fs.mkdir(botDir, { recursive: true });
  await fs.writeFile(
    getDiscordBotConfigPath(),
    JSON.stringify(normalized, null, 2),
    { encoding: 'utf-8' },
  );

  return normalized;
}

export function maskDiscordBotConfigForRenderer(
  config: DiscordBotConfig,
): DiscordBotConfig {
  return {
    ...config,
    discord: {
      ...config.discord,
      token: config.discord.token ? '********' : '',
    },
    managementApi: {
      ...config.managementApi,
      apiKey: config.managementApi.apiKey ? '********' : '',
    },
  };
}
