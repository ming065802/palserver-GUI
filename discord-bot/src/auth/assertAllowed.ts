import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { DiscordBotConfig } from '../types';
import { UserFacingError } from '../config';

export function assertCanManage(
  interaction: ChatInputCommandInteraction,
  config: DiscordBotConfig,
) {
  if (!config.dangerousCommandsRequireAdmin) {
    return;
  }

  if (config.discord.allowedUserIds.includes(interaction.user.id)) {
    return;
  }

  const member = interaction.member;

  if (member && typeof member !== 'string' && 'roles' in member) {
    const guildMember = member as GuildMember;
    const hasRole = guildMember.roles.cache.some((role) =>
      config.discord.allowedRoleIds.includes(role.id),
    );

    if (hasRole) {
      return;
    }
  }

  throw new UserFacingError('你沒有權限執行此指令。');
}
