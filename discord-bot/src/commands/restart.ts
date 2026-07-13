import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { assertCanManage } from '../auth/assertAllowed';
import { DiscordBotConfig } from '../types';
import { resolveServerId, UserFacingError } from '../config';

export const restartCommand = new SlashCommandBuilder()
  .setName('restart')
  .setDescription('重啟本機伺服器實例')
  .addStringOption((option) =>
    option
      .setName('serverid')
      .setDescription('伺服器 ID（省略則使用預設）')
      .setRequired(false),
  )
  .addIntegerOption((option) =>
    option
      .setName('waitminutes')
      .setDescription('關閉前等待分鐘數（預設 1）')
      .setMinValue(0)
      .setMaxValue(60)
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('重啟前廣播訊息')
      .setRequired(false),
  );

export async function executeRestart(
  interaction: ChatInputCommandInteraction,
  config: DiscordBotConfig,
  api: ManagementApiClient,
) {
  await interaction.deferReply({ ephemeral: true });

  try {
    assertCanManage(interaction, config);
    const serverId = resolveServerId(
      config,
      interaction.options.getString('serverid'),
    );
    const waitMinutes = interaction.options.getInteger('waitminutes') ?? 1;
    const message =
      interaction.options.getString('message') ?? 'Server restarting';
    const result = await api.restartServer(serverId, { waitMinutes, message });
    await interaction.editReply({
      content: `✅ 已重啟伺服器 \`${serverId}\`（PID: ${result.processId ?? '—'}）`,
    });
  } catch (error) {
    const response =
      error instanceof UserFacingError
        ? error.message
        : formatManagementApiError(error);
    await interaction.editReply({ content: `❌ ${response}` });
  }
}
