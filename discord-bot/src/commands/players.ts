import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { DiscordBotConfig } from '../types';
import { resolveServerId, UserFacingError } from '../config';
import { formatPlayersEmbed } from '../utils/formatPlayersEmbed';

export const playersCommand = new SlashCommandBuilder()
  .setName('players')
  .setDescription('查詢伺服器線上玩家列表')
  .addStringOption((option) =>
    option
      .setName('serverid')
      .setDescription('伺服器 ID（省略則使用預設）')
      .setRequired(false),
  );

export async function executePlayers(
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
    const data = await api.getServerPlayers(serverId);
    const players = Array.isArray(data.players) ? data.players : [];
    await interaction.editReply({
      embeds: [formatPlayersEmbed(serverId, players)],
    });
  } catch (error) {
    const message =
      error instanceof UserFacingError
        ? error.message
        : formatManagementApiError(error);
    await interaction.editReply({ content: `❌ ${message}` });
  }
}
