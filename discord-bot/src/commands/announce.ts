import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ManagementApiClient, formatManagementApiError } from '../api/managementApiClient';
import { assertCanManage } from '../auth/assertAllowed';
import { DiscordBotConfig } from '../types';
import { resolveServerId, UserFacingError } from '../config';

export const announceCommand = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('向遊戲內發送全服廣播訊息')
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('要廣播的訊息內容')
      .setRequired(true)
      .setMaxLength(200),
  )
  .addStringOption((option) =>
    option
      .setName('serverid')
      .setDescription('伺服器 ID（省略則使用預設）')
      .setRequired(false),
  );

export async function executeAnnounce(
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
    const message = interaction.options.getString('message', true);
    await api.announceServer(serverId, message);
    await interaction.editReply({
      content: `✅ 已向伺服器 \`${serverId}\` 發送廣播：${message}`,
    });
  } catch (error) {
    const message =
      error instanceof UserFacingError
        ? error.message
        : formatManagementApiError(error);
    await interaction.editReply({ content: `❌ ${message}` });
  }
}
