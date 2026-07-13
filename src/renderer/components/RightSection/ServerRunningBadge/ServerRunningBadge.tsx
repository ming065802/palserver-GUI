import { Badge } from '@radix-ui/themes';
import React from 'react';
import useSelectedServerInstance from '../../../redux/selectedServerInstance/useSelectedServerInstance';
import useServerOnlineStatus from '../../../hooks/server/useServerOnlineStatus';

export default function ServerRunningBadge() {
  const { selectedServerInstance } = useSelectedServerInstance();
  const isOnline = useServerOnlineStatus(selectedServerInstance);

  return (
    <div className="self-end">
      {isOnline ? (
        <Badge color="grass" size="3" variant="solid">
          Online
        </Badge>
      ) : (
        <Badge color="red" size="3" variant="solid">
          Offline
        </Badge>
      )}
    </div>
  );
}
