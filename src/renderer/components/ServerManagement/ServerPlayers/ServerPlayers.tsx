import { Callout } from '@radix-ui/themes';
import useServerOnlinePlayers from '../../../hooks/server/players/useServerOnlinePlayers';
import useSelectedServerInstance from '../../../redux/selectedServerInstance/useSelectedServerInstance';
import PlayerPreview from './PlayerPreview/PlayerPreview';
import useTranslation from '../../../hooks/translation/useTranslation';
import useServerBanList from '../../../hooks/server/ban/useServerBanList';

export default function ServerPlayers() {
  const { t } = useTranslation();

  const { selectedServerInstance } = useSelectedServerInstance();
  const { remoteLimited } = useServerBanList(selectedServerInstance);

  const players = useServerOnlinePlayers(selectedServerInstance);

  return (
    <div className="w-full h-full mt-4 flex flex-col gap-3">
      {remoteLimited && (
        <Callout.Root color="amber" size="1">
          <Callout.Text>{t('RemoteBanListNotAvailable')}</Callout.Text>
        </Callout.Root>
      )}
      {players.length ? (
        <div className="w-full flex justify-between pr-4">
          <div className="w-full h-[calc(100vh-180px)] overflow-y-scroll flex flex-col gap-4">
            {players.map((player, i) => (
              <PlayerPreview playerIndex={i} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-2xl opacity-60 p-4">
            {t('ServerHasNoPlayers')}
          </div>
        </div>
      )}
    </div>
  );
}
