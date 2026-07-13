import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { DiscordBotConfig } from '../types';
import { formatServersEmbed } from '../utils/formatStatusEmbed';

export const serversCommand = new SlashCommandBuilder()
  .setName('servers')
  .setDescription('列出所有可管理的伺服器實例');

export async function executeServers(
  interaction: ChatInputCommandInteraction,
  _config: DiscordBotConfig,
  api: ManagementApiClient,
) {
  await interaction.deferReply();

  try {
    const { servers } = await api.listServers();
    await interaction.editReply({ embeds: [formatServersEmbed(servers)] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ ${formatManagementApiError(error)}`,
    });
  }
}
