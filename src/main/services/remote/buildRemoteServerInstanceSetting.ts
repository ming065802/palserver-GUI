import path from 'path';
import { ServerInstanceSetting } from '../../../types/ServerInstanceSetting.types';
import { RemoteSettings } from '../../../types/RemoteSettings.types';
import { CreateRemoteServerInstanceInput } from '../../../types/RemoteConnection.types';
import {
  DEFAULT_RCON_PORT,
  DEFAULT_REST_PORT,
} from '../admin/adminConnectionConfig';
import { normalizeRemoteHost } from './testRemoteConnection';

export function buildRemoteServerInstanceSetting(
  instancesRoot: string,
  serverId: string,
  input: CreateRemoteServerInstanceInput,
): {
  serverInstanceSetting: ServerInstanceSetting;
  remoteSettings: RemoteSettings;
} {
  const createdTime = Date.now();
  const instancePath = path.join(instancesRoot, serverId);
  const host = normalizeRemoteHost(input.PublicIP);
  const restPort = Number(input.RESTAPIPort) || DEFAULT_REST_PORT;
  const rconPort = Number(input.RCONPort) || DEFAULT_RCON_PORT;

  const remoteSettings: RemoteSettings = {
    ServerName: input.ServerName,
    PublicIP: host,
    RESTAPIPort: restPort,
    RCONPort: rconPort,
    AdminPassword: input.AdminPassword,
    RESTAPIEnabled: true,
    RCONEnabled: input.RCONEnabled ?? false,
  };

  const serverInstanceSetting: ServerInstanceSetting = {
    serverId,
    instancePath,
    serverPath: instancePath,
    iconId: 'SheepBall',
    createdAt: createdTime,
    isRemote: true,
    remoteHost: host,
    remoteRestPort: restPort,
    remoteRconPort: rconPort,
    performanceOptimizationEnabled: false,
    performanceMonitorEnabled: false,
    performanceMonitorAnimationEnabled: true,
    ue4ssEnabled: false,
    palguardEnabled: false,
    modManagementEnabled: false,
    AutoRestart: 0,
    CrashRestart: false,
    OverRamRestart: false,
    openToCommunity: false,
    OnlineMapEnabled: true,
    LogEnabled: false,
    UseIndependentProcess: true,
  };

  return { serverInstanceSetting, remoteSettings };
}
