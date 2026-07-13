import uniqid from 'uniqid';
import fs from 'fs/promises';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import { CreateRemoteServerInstanceInput } from '../../../types/RemoteConnection.types';
import writeRemoteSettings from './writeRemoteSettings';
import { buildRemoteServerInstanceSetting } from './buildRemoteServerInstanceSetting';

export { buildRemoteServerInstanceSetting } from './buildRemoteServerInstanceSetting';

export default async function createRemoteServerInstance(
  input: CreateRemoteServerInstanceInput,
) {
  const serverId = uniqid('sr-');
  const { serverInstanceSetting, remoteSettings } =
    buildRemoteServerInstanceSetting(
      USER_SERVER_INSTANCES_PATH,
      serverId,
      input,
    );
  const instancePath = serverInstanceSetting.instancePath;

  await fs.mkdir(instancePath, { recursive: true });
  await fs.writeFile(
    path.join(instancePath, '.pal'),
    JSON.stringify(serverInstanceSetting, null, 2),
    { encoding: 'utf-8' },
  );
  await writeRemoteSettings(serverId, remoteSettings);

  return serverId;
}
