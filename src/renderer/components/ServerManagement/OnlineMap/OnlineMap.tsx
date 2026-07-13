import React from 'react';
import { Callout } from '@radix-ui/themes';
import useSelectedServerInstance from '../../../redux/selectedServerInstance/useSelectedServerInstance';
import useIsRemote from '../../../hooks/server/useIsRemote';
import useServerOnlineStatus from '../../../hooks/server/useServerOnlineStatus';
import useTranslation from '../../../hooks/translation/useTranslation';
import { LuExternalLink } from 'react-icons/lu';

export default function OnlineMap() {
  const { t } = useTranslation();
  const { selectedServerInstance } = useSelectedServerInstance();
  const isRemote = useIsRemote();
  const remoteOnline = useServerOnlineStatus(selectedServerInstance);
  const mapUrl = `http://127.0.0.1:3434/?id=${selectedServerInstance}`;

  return (
    <div className="relative w-full">
      {isRemote && !remoteOnline && (
        <Callout.Root color="amber" className="mx-4 mt-4">
          <Callout.Text>{t('RemoteOnlineMapUnreachable')}</Callout.Text>
        </Callout.Root>
      )}
      <iframe className="pt-4 w-full h-[calc(100vh-160px)]" src={mapUrl} />
      <div
        onClick={() => {
          window.electron.openLink(mapUrl);
        }}
        className="absolute top-6 right-2 z-10 hover:scale-110 transition-all opacity-75 hover:opacity-100"
      >
        <LuExternalLink size={32} />
      </div>
    </div>
  );
}
