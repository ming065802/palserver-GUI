import { ipcMain } from 'electron';
import Channels from '../channels';
import {
  maskDiscordBotConfigForRenderer,
  readDiscordBotConfig,
  writeDiscordBotConfig,
} from '../../services/discord-bot/discordBotConfig';
import {
  getDiscordBotStatus,
  reloadDiscordBot,
  stopDiscordBot,
} from '../../services/discord-bot/discordBotProcess';
import { DiscordBotConfig } from '../../../types/DiscordBot.types';

function mergeSensitiveField(
  currentValue: string,
  nextValue: string | undefined,
  maskedPlaceholder = '********',
) {
  if (nextValue === undefined) {
    return currentValue;
  }

  if (nextValue === maskedPlaceholder || nextValue === '') {
    return currentValue;
  }

  return nextValue;
}

ipcMain.handle(
  Channels.setDiscordBotConfig,
  async (_event, config: Partial<DiscordBotConfig>) => {
    const current = readDiscordBotConfig();

    const nextConfig = await writeDiscordBotConfig({
      ...config,
      discord: {
        ...current.discord,
        ...config.discord,
        token: mergeSensitiveField(
          current.discord.token,
          config.discord?.token,
        ),
      },
      managementApi: {
        ...current.managementApi,
        ...config.managementApi,
        apiKey: mergeSensitiveField(
          current.managementApi.apiKey,
          config.managementApi?.apiKey,
        ),
      },
    });

    if (nextConfig.enabled) {
      await reloadDiscordBot();
    } else {
      await stopDiscordBot();
    }

    return {
      config: maskDiscordBotConfigForRenderer(nextConfig),
      status: getDiscordBotStatus(),
    };
  },
);
