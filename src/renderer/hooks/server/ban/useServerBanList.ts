import { useEffect, useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import type { ServerBanListResult } from '../../../../main/services/ban/getServerBanList';

const useServerBanList = (serverId: string) => {
  const [banList, setBanList] = useState<string[]>([]);
  const [remoteLimited, setRemoteLimited] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke(Channels.getServerBanList, serverId)
      .then((result: ServerBanListResult | string[]) => {
        if (Array.isArray(result)) {
          setBanList(result);
          setRemoteLimited(false);
          return;
        }

        setBanList(result.bans);
        setRemoteLimited(result.remoteLimited);
      })
      .catch(() => {
        setBanList([]);
        setRemoteLimited(false);
      });
  }, [serverId]);

  return { banList, remoteLimited };
};

export default useServerBanList;
