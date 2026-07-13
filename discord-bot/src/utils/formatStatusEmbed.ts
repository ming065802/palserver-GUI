import { EmbedBuilder } from 'discord.js';
import { ManagementApiServerStatus } from '../types';

function formatBoolean(value: boolean | undefined) {
  return value ? '是' : '否';
}

export function formatStatusEmbed(status: ManagementApiServerStatus) {
  const color = status.running ? 0x57f287 : 0xed4245;

  return new EmbedBuilder()
    .setTitle(`伺服器狀態：${status.serverName || status.serverId}`)
    .setColor(color)
    .addFields(
      { name: 'Server ID', value: status.serverId, inline: true },
      { name: '運行中', value: formatBoolean(status.running), inline: true },
      { name: '遠端實例', value: formatBoolean(status.isRemote), inline: true },
      {
        name: 'REST 可達',
        value: formatBoolean(status.restReachable),
        inline: true,
      },
      {
        name: 'Process ID',
        value: status.processId ? String(status.processId) : '—',
        inline: true,
      },
      {
        name: 'Query Port',
        value: status.queryPort ? String(status.queryPort) : '—',
        inline: true,
      },
    );
}

export function formatServersEmbed(
  servers: ManagementApiServerStatus[],
) {
  if (servers.length === 0) {
    return new EmbedBuilder()
      .setTitle('伺服器列表')
      .setDescription('目前沒有可管理的伺服器實例。')
      .setColor(0x5865f2);
  }

  const lines = servers.map((server) => {
    const state = server.running ? '🟢 運行中' : '🔴 離線';
    const remote = server.isRemote ? '（遠端）' : '（本機）';
    return `• **${server.serverName || server.serverId}** \`${server.serverId}\` — ${state} ${remote}`;
  });

  return new EmbedBuilder()
    .setTitle('伺服器列表')
    .setDescription(lines.join('\n'))
    .setColor(0x5865f2);
}
