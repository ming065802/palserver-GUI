import { ipcMain } from 'electron';
import Channels from '../channels';
import {
  maskDiscordBotConfigForRenderer,
  readDiscordBotConfig,
} from '../../services/discord-bot/discordBotConfig';
import { getDiscordBotStatus } from '../../services/discord-bot/discordBotProcess';

ipcMain.handle(Channels.getDiscordBotConfig, async () => {
  const config = readDiscordBotConfig();
  const status = getDiscordBotStatus();

  return {
    config: maskDiscordBotConfigForRenderer(config),
    status,
  };
});
