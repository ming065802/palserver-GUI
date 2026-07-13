import { Client, Events, GatewayIntentBits } from 'discord.js';
import { createManagementApiClient } from '../api/managementApiClient';
import { DiscordBotConfig } from '../types';
import { executeRestart } from '../commands/restart';
import { executeServers } from '../commands/servers';
import { executeStart } from '../commands/start';
import { executeStatus } from '../commands/status';
import { executeStop } from '../commands/stop';

export function createDiscordClient(config: DiscordBotConfig) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const api = createManagementApiClient({
    baseUrl: config.managementApi.baseUrl,
    apiKey: config.managementApi.apiKey,
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord bot logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {
      switch (interaction.commandName) {
        case 'status':
          await executeStatus(interaction, config, api);
          break;
        case 'servers':
          await executeServers(interaction, config, api);
          break;
        case 'start':
          await executeStart(interaction, config, api);
          break;
        case 'stop':
          await executeStop(interaction, config, api);
          break;
        case 'restart':
          await executeRestart(interaction, config, api);
          break;
        default:
          await interaction.reply({
            content: '未知指令',
            ephemeral: true,
          });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '指令執行失敗';
      console.error('Command error:', message);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: `❌ ${message}` });
      } else {
        await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
      }
    }
  });

  return client;
}
