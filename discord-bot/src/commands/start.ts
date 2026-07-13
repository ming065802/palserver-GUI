import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { assertCanManage } from '../auth/assertAllowed';
import { DiscordBotConfig } from '../types';
import { resolveServerId, UserFacingError } from '../config';

export const startCommand = new SlashCommandBuilder()
  .setName('start')
  .setDescription('啟動本機伺服器實例')
  .addStringOption((option) =>
    option
      .setName('serverid')
      .setDescription('伺服器 ID（省略則使用預設）')
      .setRequired(false),
  );

export async function executeStart(
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
    const result = await api.startServer(serverId);
    await interaction.editReply({
      content: `✅ 已啟動伺服器 \`${serverId}\`（PID: ${result.processId ?? '—'}）`,
    });
  } catch (error) {
    const message =
      error instanceof UserFacingError
        ? error.message
        : formatManagementApiError(error);
    await interaction.editReply({ content: `❌ ${message}` });
  }
}
