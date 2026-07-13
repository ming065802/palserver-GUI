import useSelectedServerInstance from '../../redux/selectedServerInstance/useSelectedServerInstance';
import useServerInfo from './info/useServerInfo';

export default function useIsRemote(serverId?: string) {
  const { selectedServerInstance } = useSelectedServerInstance();
  const resolvedServerId = serverId ?? selectedServerInstance;
  const { serverInfo } = useServerInfo(resolvedServerId);

  return Boolean(serverInfo?.isRemote);
}
