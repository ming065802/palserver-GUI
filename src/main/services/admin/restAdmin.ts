import axios from 'axios';
import trimWorldSettingsString from '../../../utils/trimWorldSettingsString';
import { LOCALHOST } from './adminConnectionConfig';

export type RestAdminConfig = {
  host: string;
  port: number;
  password: string;
};

export function isRestApiEnabled(worldSettings: Record<string, unknown>) {
  return worldSettings.RESTAPIEnabled === true;
}

export function getRestAdminConfig(
  worldSettings: Record<string, unknown>,
  host = LOCALHOST,
): RestAdminConfig {
  return {
    host,
    port: Number(worldSettings.RESTAPIPort) || 8212,
    password: trimWorldSettingsString(String(worldSettings.AdminPassword || '')),
  };
}

async function restRequest(
  config: RestAdminConfig,
  api: string,
  options?: { method?: string; body?: unknown },
) {
  const result = await axios(`http://${config.host}:${config.port}/v1/api${api}`, {
    method: options?.method || 'get',
    auth: {
      username: 'admin',
      password: config.password,
    },
    data: options?.body,
  });

  return result.data;
}

export async function restGetInfo(config: RestAdminConfig) {
  return restRequest(config, '/info');
}

export async function restGetPlayers(config: RestAdminConfig) {
  return restRequest(config, '/players');
}

export async function restSave(config: RestAdminConfig) {
  return restRequest(config, '/save', { method: 'post' });
}

export async function restShutdown(
  config: RestAdminConfig,
  waittime = 60,
  message = 'Server restarting',
) {
  return restRequest(config, '/shutdown', {
    method: 'post',
    body: { waittime, message },
  });
}

export async function restKick(
  config: RestAdminConfig,
  userId: string,
  message = '',
) {
  return restRequest(config, '/kick', {
    method: 'post',
    body: { userid: userId, message },
  });
}

export async function restBan(
  config: RestAdminConfig,
  userId: string,
  message = '',
) {
  return restRequest(config, '/ban', {
    method: 'post',
    body: { userid: userId, message },
  });
}

export async function restUnban(config: RestAdminConfig, userId: string) {
  return restRequest(config, '/unban', {
    method: 'post',
    body: { userid: userId },
  });
}

export async function restAnnounce(config: RestAdminConfig, message: string) {
  return restRequest(config, '/announce', {
    method: 'post',
    body: { message },
  });
}

export async function restGetSettings(config: RestAdminConfig) {
  return restRequest(config, '/settings');
}
