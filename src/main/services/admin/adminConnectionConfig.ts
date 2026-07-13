import trimWorldSettingsString from '../../../utils/trimWorldSettingsString';
import { ServerInstanceSetting } from '../../../types/ServerInstanceSetting.types';

export const LOCALHOST = '127.0.0.1';
export const DEFAULT_REST_PORT = 8212;
export const DEFAULT_RCON_PORT = 25575;

export type AdminConnectionConfig = {
  host: string;
  restPort: number;
  rconPort: number;
  adminPassword: string;
};

type ServerInfoForConnection = Pick<
  ServerInstanceSetting,
  'isRemote' | 'remoteHost' | 'remoteRestPort' | 'remoteRconPort'
>;

export function resolveAdminConnectionConfig(
  serverInfo: ServerInfoForConnection,
  worldSettings: Record<string, unknown>,
): AdminConnectionConfig {
  const adminPassword = trimWorldSettingsString(
    String(worldSettings.AdminPassword || ''),
  );

  if (serverInfo.isRemote) {
    const host = serverInfo.remoteHost || String(worldSettings.PublicIP || '');

    return {
      host,
      restPort:
        serverInfo.remoteRestPort ??
        (Number(worldSettings.RESTAPIPort) || DEFAULT_REST_PORT),
      rconPort:
        serverInfo.remoteRconPort ??
        (Number(worldSettings.RCONPort) || DEFAULT_RCON_PORT),
      adminPassword,
    };
  }

  return {
    host: LOCALHOST,
    restPort: Number(worldSettings.RESTAPIPort) || DEFAULT_REST_PORT,
    rconPort: Number(worldSettings.RCONPort) || DEFAULT_RCON_PORT,
    adminPassword,
  };
}

export function getRconOptions(config: AdminConnectionConfig) {
  return {
    ipAddress: config.host,
    port: config.rconPort,
    password: config.adminPassword,
  };
}
