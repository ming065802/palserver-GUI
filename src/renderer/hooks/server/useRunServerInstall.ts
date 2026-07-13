import { useEffect, useState } from 'react';
import Channels from '../../../main/ipcs/channels';
import useTranslation from '../translation/useTranslation';
import electronAlert from '../../utils/electronAlert';
import useLocalState from '../useLocalState';
import useLatestGameVersion from '../firebase/useLatestGameVersion';
import useServerEngineVersion from './useServerEngineVersion';
import { isVersionOlder } from '../../utils/versionToValue';

const useRunServerInstall = () => {
  const { t } = useTranslation();

  const { version: latestVersion, versionValue: latestGameVersion } =
    useLatestGameVersion();

  const [serverEngineVersion, setServerEngineVersion] =
    useServerEngineVersion();

  const [serverEngineHasInstall, setServerEngineHasInstall] = useState(false);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    if (latestVersion) {
      if (isVersionOlder(serverEngineVersion, latestVersion)) {
        if (!serverEngineHasInstall) {
          // 執行伺服器安裝
          window.electron.ipcRenderer.sendMessage(Channels.runServerInstall);
          window.electron.ipcRenderer.once(
            Channels.runServerInstallReply.DONE,
            () => {
              setServerEngineHasInstall(true);
              setServerEngineVersion(latestVersion || latestGameVersion);
              // electronAlert(t('EngineInstallFinish'));
            },
          );
          window.electron.ipcRenderer.once(
            Channels.runServerInstallReply.ERROR,
            (data) => {
              if (data.errorMessage === 'ASCII') {
                electronAlert(
                  // eslint-disable-next-line no-underscore-dangle
                  t('HasNotASCIIPath') + window.electron.node.__dirname(),
                );
              }
            },
          );
          window.electron.ipcRenderer.on(
            Channels.runServerInstallReply.PROGRESS,
            (data) => {
              if (data.message) {
                setInstallMessage(data.message);
              }
            },
          );
        }
      } else {
        setServerEngineHasInstall(true);
      }
    }
  }, [serverEngineHasInstall, latestVersion, latestGameVersion, serverEngineVersion, setServerEngineVersion, t]);

  return [serverEngineHasInstall, installMessage];
};

export default useRunServerInstall;
