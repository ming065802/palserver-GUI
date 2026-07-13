import { EmbedBuilder } from 'discord.js';
import { PalworldPlayer } from '../types';

const MAX_PLAYER_FIELDS = 25;

function formatPlayerLine(player: PalworldPlayer, index: number) {
  const name = player.name?.trim() || `玩家 ${index + 1}`;
  const level =
    typeof player.level === 'number' ? `Lv.${player.level}` : 'Lv.?';
  const ping =
    typeof player.ping === 'number' ? `${player.ping}ms` : undefined;

  const details = [level, ping].filter(Boolean).join(' · ');
  return details ? `${name}（${details}）` : name;
}

export function formatPlayersEmbed(serverId: string, players: PalworldPlayer[]) {
  const onlinePlayers = players.filter(
    (player) => player && (player.name || player.playerId || player.userId),
  );
  const embed = new EmbedBuilder()
    .setTitle(`線上玩家 — ${serverId}`)
    .setColor(onlinePlayers.length > 0 ? 0x57f287 : 0x95a5a6)
    .setFooter({ text: `共 ${onlinePlayers.length} 位玩家在線` });

  if (onlinePlayers.length === 0) {
    embed.setDescription('目前沒有玩家在線。');
    return embed;
  }

  const visiblePlayers = onlinePlayers.slice(0, MAX_PLAYER_FIELDS);
  const lines = visiblePlayers.map((player, index) =>
    formatPlayerLine(player, index),
  );

  embed.setDescription(lines.join('\n'));

  if (onlinePlayers.length > MAX_PLAYER_FIELDS) {
    embed.addFields({
      name: '更多玩家',
      value: `另有 ${onlinePlayers.length - MAX_PLAYER_FIELDS} 位玩家未顯示。`,
    });
  }

  return embed;
}
