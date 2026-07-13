import Channels from '../../main/ipcs/channels';

type RestAdminBody = {
  body?: Record<string, unknown>;
  method?: string;
};

async function sendRestAdmin(
  serverId: string,
  api: string,
  options?: RestAdminBody,
) {
  return window.electron.ipcRenderer.invoke(
    Channels.sendRestAPI,
    serverId,
    api,
    options,
  );
}

export function restKickPlayer(
  serverId: string,
  userId: string,
  message = '',
) {
  return sendRestAdmin(serverId, '/kick', {
    method: 'post',
    body: { userid: userId, message },
  });
}

export function restBanPlayer(
  serverId: string,
  userId: string,
  message = '',
) {
  return sendRestAdmin(serverId, '/ban', {
    method: 'post',
    body: { userid: userId, message },
  });
}

export function restUnbanPlayer(serverId: string, userId: string) {
  return sendRestAdmin(serverId, '/unban', {
    method: 'post',
    body: { userid: userId },
  });
}

export function restSaveWorld(serverId: string) {
  return sendRestAdmin(serverId, '/save', { method: 'post' });
}

export function restShutdownServer(
  serverId: string,
  waittime = 60,
  message = 'Server restarting',
) {
  return sendRestAdmin(serverId, '/shutdown', {
    method: 'post',
    body: { waittime, message },
  });
}

export function restGetServerInfo(serverId: string) {
  return sendRestAdmin(serverId, '/info');
}

export function restAnnounce(serverId: string, message: string) {
  return sendRestAdmin(serverId, '/announce', {
    method: 'post',
    body: { message },
  });
}

export function restGetSettings(serverId: string) {
  return sendRestAdmin(serverId, '/settings');
}
