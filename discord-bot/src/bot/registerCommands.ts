import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { DiscordBotConfig } from '../types';
import { restartCommand } from '../commands/restart';
import { announceCommand } from '../commands/announce';
import { playersCommand } from '../commands/players';
import { serversCommand } from '../commands/servers';
import { startCommand } from '../commands/start';
import { statusCommand } from '../commands/status';
import { stopCommand } from '../commands/stop';

const commandBuilders = [
  statusCommand,
  serversCommand,
  playersCommand,
  announceCommand,
  startCommand,
  stopCommand,
  restartCommand,
] as const;

export async function registerSlashCommands(config: DiscordBotConfig) {
  const { token, clientId, guildId } = config.discord;

  if (!token || !clientId) {
    throw new Error('Discord token and clientId are required');
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const body = commandBuilders.map((command) => command.toJSON());

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body,
    });
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body });
}
