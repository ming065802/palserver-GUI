import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import fsc from 'fs';
import readWorldSettingsini from './readWorldSettingsini';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import readRemoteSettings from '../remote/readRemoteSettings';

async function getLocalWorldSettings(serverId: string) {
  const worldSettingsPath = path.join(
    USER_SERVER_INSTANCES_PATH,
    serverId,
    'server',
    'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
  );

  if (fsc.existsSync(worldSettingsPath)) {
    return readWorldSettingsini(worldSettingsPath);
  }

  return {};
}

export default async (serverId: string) => {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    return readRemoteSettings(serverId);
  }

  return getLocalWorldSettings(serverId);
};
