import fs from 'fs/promises';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import { ServerInstanceSetting } from '../../../types/ServerInstanceSetting.types';
import { RemoteSettings } from '../../../types/RemoteSettings.types';
import readRemoteSettings from './readRemoteSettings';
import writeRemoteSettings from './writeRemoteSettings';
import { normalizeRemoteHost } from './testRemoteConnection';
import {
  DEFAULT_RCON_PORT,
  DEFAULT_REST_PORT,
} from '../admin/adminConnectionConfig';

export type EditRemoteServerInstanceInput = {
  ServerName?: string;
  PublicIP?: string;
  RESTAPIPort?: number;
  RCONPort?: number;
  AdminPassword?: string;
};

export default async function editRemoteServerInstance(
  serverId: string,
  input: EditRemoteServerInstanceInput,
) {
  const instancePath = path.join(USER_SERVER_INSTANCES_PATH, serverId);
  const serverInstanceSettingPath = path.join(instancePath, '.pal');

  const prevServerInstanceSetting: ServerInstanceSetting = JSON.parse(
    await fs.readFile(serverInstanceSettingPath, { encoding: 'utf-8' }),
  );

  if (!prevServerInstanceSetting.isRemote) {
    throw new Error('Not a remote server instance');
  }

  const prevRemoteSettings = await readRemoteSettings(serverId);
  const host = input.PublicIP
    ? normalizeRemoteHost(input.PublicIP)
    : prevRemoteSettings.PublicIP || prevServerInstanceSetting.remoteHost || '';
  const restPort =
    input.RESTAPIPort ??
    prevRemoteSettings.RESTAPIPort ??
    prevServerInstanceSetting.remoteRestPort ??
    DEFAULT_REST_PORT;
  const rconPort =
    input.RCONPort ??
    prevRemoteSettings.RCONPort ??
    prevServerInstanceSetting.remoteRconPort ??
    DEFAULT_RCON_PORT;

  const remoteSettings: RemoteSettings = {
    ServerName:
      input.ServerName ??
      prevRemoteSettings.ServerName ??
      '',
    PublicIP: host,
    RESTAPIPort: restPort,
    RCONPort: rconPort,
    AdminPassword:
      input.AdminPassword ??
      prevRemoteSettings.AdminPassword ??
      '',
    RESTAPIEnabled: prevRemoteSettings.RESTAPIEnabled ?? true,
    RCONEnabled: prevRemoteSettings.RCONEnabled ?? false,
  };

  const serverInstanceSetting: ServerInstanceSetting = {
    ...prevServerInstanceSetting,
    editedAt: Date.now(),
    remoteHost: host,
    remoteRestPort: restPort,
    remoteRconPort: rconPort,
  };

  await fs.writeFile(
    serverInstanceSettingPath,
    JSON.stringify(serverInstanceSetting, null, 2),
    { encoding: 'utf-8' },
  );
  await writeRemoteSettings(serverId, remoteSettings);

  return serverId;
}
