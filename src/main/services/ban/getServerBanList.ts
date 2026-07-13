import path from 'path';
import fsc from 'fs';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';

export type ServerBanListResult = {
  bans: string[];
  remoteLimited: boolean;
};

export default async function getServerBanList(
  serverId: string,
): Promise<ServerBanListResult> {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    return {
      bans: [],
      remoteLimited: true,
    };
  }

  const banListPath = path.join(
    USER_SERVER_INSTANCES_PATH,
    serverId,
    'server',
    'Pal/Saved/SaveGames/banlist.txt',
  );

  if (!fsc.existsSync(banListPath)) {
    return {
      bans: [],
      remoteLimited: false,
    };
  }

  const banListTxt = fsc.readFileSync(banListPath, { encoding: 'utf-8' });
  const bans = banListTxt.split('\n').filter((line) => line.length > 0);

  return {
    bans,
    remoteLimited: false,
  };
}
