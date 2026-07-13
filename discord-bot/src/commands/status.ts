import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { DiscordBotConfig } from '../types';
import { resolveServerId, UserFacingError } from '../config';
import { formatStatusEmbed } from '../utils/formatStatusEmbed';

export const statusCommand = new SlashCommandBuilder()
  .setName('status')
  .setDescription('查詢伺服器運行狀態')
  .addStringOption((option) =>
    option
      .setName('serverid')
      .setDescription('伺服器 ID（省略則使用預設）')
      .setRequired(false),
  );

export async function executeStatus(
  interaction: ChatInputCommandInteraction,
  config: DiscordBotConfig,
  api: ManagementApiClient,
) {
  await interaction.deferReply();

  try {
    const serverId = resolveServerId(
      config,
      interaction.options.getString('serverid'),
    );
    const status = await api.getServerStatus(serverId);
    await interaction.editReply({ embeds: [formatStatusEmbed(status)] });
  } catch (error) {
    const message =
      error instanceof UserFacingError
        ? error.message
        : formatManagementApiError(error);
    await interaction.editReply({ content: `❌ ${message}` });
  }
}
