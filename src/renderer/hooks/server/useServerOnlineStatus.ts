import { useEffect, useState } from 'react';
import useIsRunningServers from '../../redux/isRunningServers/useIsRunningServers';
import { restGetServerInfo } from '../../utils/restAdmin';
import useIsRemote from './useIsRemote';

export const REMOTE_STATUS_POLL_MS = 30_000;

export default function useServerOnlineStatus(serverId?: string) {
  const isRemote = useIsRemote(serverId);
  const { includeRunningServers } = useIsRunningServers();
  const [remoteOnline, setRemoteOnline] = useState(false);

  useEffect(() => {
    if (!serverId || !isRemote) {
      return undefined;
    }

    const checkStatus = () => {
      restGetServerInfo(serverId)
        .then(() => {
          setRemoteOnline(true);
        })
        .catch(() => {
          setRemoteOnline(false);
        });
    };

    checkStatus();
    const interval = setInterval(checkStatus, REMOTE_STATUS_POLL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [serverId, isRemote]);

  if (!serverId) {
    return false;
  }

  if (isRemote) {
    return remoteOnline;
  }

  return includeRunningServers(serverId);
}
