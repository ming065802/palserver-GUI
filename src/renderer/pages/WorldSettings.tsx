import { useEffect, useState } from 'react';
import { Callout, IconButton, Spinner, Tabs, Tooltip } from '@radix-ui/themes';
import useTranslation from '../hooks/translation/useTranslation';
import { MdEditDocument } from 'react-icons/md';
import { LuRefreshCw } from 'react-icons/lu';
import { TbJson } from 'react-icons/tb';
import { LuAppWindow } from 'react-icons/lu';
import { isEmpty, map, pickBy } from 'lodash';
import {
  BuildSettingsOptionsKey,
  DropSettingsOptionsKey,
  GuildSettingsOptionsKey,
  OthersSettingsOptionsKey,
  PalSettingsOptionsKey,
  PlayerSettingsOptionsKey,
  worldSettingsOptions,
} from '../components/WorldSettings/settings';
import useSelectedServerInstance from '../redux/selectedServerInstance/useSelectedServerInstance';
import useWorldSettings from '../hooks/server/world-settings/useWorldSettings';
import useRemoteWorldSettings from '../hooks/server/world-settings/useRemoteWorldSettings';
import useIsRemote from '../hooks/server/useIsRemote';
import WorldSettingsItem from '../components/WorldSettings/WorldSettingsItem/WorldSettingsItem';
import WorldSettingsJSONView from '../components/WorldSettings/WorldSettingsJSONView/WorldSettingsJSONView';
import WorldSettingsActionbar from '../components/WorldSettings/WorldSettingsActionbar/WorldSettingsActionbar';
import RemoteUnsupportedGuard from '../components/RemoteUnsupportedGuard';

export default function WorldSettings() {
  const { t } = useTranslation();
  const isRemote = useIsRemote();

  const { selectedServerInstance } = useSelectedServerInstance();

  const [hasInitWorldSettings, setHasInitWorldSettings] = useState(false);
  const { worldSettings: prevWorldSettings } = useWorldSettings(
    isRemote ? '' : selectedServerInstance,
  );
  const {
    worldSettings: remoteWorldSettings,
    loading: remoteLoading,
    error: remoteError,
    refetch: refetchRemoteSettings,
    hasUnknownKeys,
  } = useRemoteWorldSettings(isRemote ? selectedServerInstance : '');

  const [worldSettings, setWorldSettings] = useState<any>({});
  useEffect(() => {
    if (isRemote) {
      if (!isEmpty(remoteWorldSettings)) {
        setWorldSettings(remoteWorldSettings);
        setHasInitWorldSettings(true);
      }
      return;
    }

    if (!isEmpty(prevWorldSettings) && !hasInitWorldSettings) {
      setWorldSettings(prevWorldSettings);
      setHasInitWorldSettings(true);
    }
  }, [
    hasInitWorldSettings,
    isRemote,
    prevWorldSettings,
    remoteWorldSettings,
    selectedServerInstance,
  ]);

  useEffect(() => {
    setHasInitWorldSettings(false);
    setWorldSettings({});
  }, [isRemote, selectedServerInstance]);

  const [interfaceMode, setInterfaceMode] = useState<'gui' | 'json'>('gui');
  const readOnly = isRemote;

  return (
    <RemoteUnsupportedGuard allowRemote>
      <div className="page-container overflow-y-scroll">
        {readOnly && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            <Callout.Root color="blue">
              <Callout.Text>{t('RemoteWorldSettingsReadOnly')}</Callout.Text>
            </Callout.Root>
            {remoteError && (
              <Callout.Root color="red">
                <Callout.Text>{t('RemoteWorldSettingsFetchFailed')}</Callout.Text>
              </Callout.Root>
            )}
            {hasUnknownKeys && interfaceMode === 'gui' && (
              <Callout.Root color="amber">
                <Callout.Text>{t('RemoteWorldSettingsUnknownKeys')}</Callout.Text>
              </Callout.Root>
            )}
          </div>
        )}
        <div className="flex flex-row items-start gap-3 flex-wrap overflow-y-scroll overflow-x-hidden">
          <div className="absolute right-6 top-6 flex gap-2">
            {readOnly ? (
              <>
                <Tooltip content={t('Refresh')}>
                  <IconButton
                    onClick={() => {
                      refetchRemoteSettings();
                    }}
                    color="gray"
                    disabled={remoteLoading}
                  >
                    {remoteLoading ? <Spinner /> : <LuRefreshCw />}
                  </IconButton>
                </Tooltip>
                <Tooltip
                  content={
                    interfaceMode === 'gui'
                      ? t('WorldSettingsJsonView')
                      : t('WorldSettingsGuiView')
                  }
                >
                  <IconButton
                    onClick={() => {
                      setInterfaceMode((mode) =>
                        mode === 'gui' ? 'json' : 'gui',
                      );
                    }}
                    color="gray"
                  >
                    {interfaceMode === 'gui' ? <TbJson size={20} /> : <LuAppWindow size={18} />}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip content={t('EditFromSourceFile')}>
                <IconButton
                  onClick={() => {
                    const worldSettingsPath = window.electron.node
                      .path()
                      .join(
                        window.electron.constant.USER_SERVER_INSTANCES_PATH(),
                        selectedServerInstance,
                        'server',
                        'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
                      );

                    window.electron.openExplorer(worldSettingsPath);
                  }}
                  color="gray"
                >
                  <MdEditDocument />
                </IconButton>
              </Tooltip>
            )}
          </div>
          {interfaceMode === 'gui' ? (
            <Tabs.Root defaultValue="pal" style={{ width: '100%' }}>
              <Tabs.List>
                <Tabs.Trigger
                  value="pal"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('PalSettings')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="player"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('PlayerSettings')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="guild"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('GuildSettings')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="build"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('BuildSettings')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="drop"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('DropSettings')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="others"
                  style={{ color: 'white', fontWeight: 500 }}
                >
                  {t('OthersSettings')}
                </Tabs.Trigger>
              </Tabs.List>
              <div className="py-4">
                <Tabs.Content value="pal">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        PalSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="player">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        PlayerSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="guild">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        GuildSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="build">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        BuildSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="drop">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        DropSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="others">
                  <div className="flex flex-col justify-center gap-2 p-2">
                    {map(
                      pickBy(worldSettingsOptions, (v, k) =>
                        OthersSettingsOptionsKey.includes(k),
                      ),
                      (v, k) => (
                        <WorldSettingsItem
                          key={k}
                          id={k}
                          worldSettings={worldSettings}
                          setWorldSettings={setWorldSettings}
                          readOnly={readOnly}
                        />
                      ),
                    )}
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          ) : (
            <WorldSettingsJSONView worldSettings={worldSettings} />
          )}
        </div>
        <WorldSettingsActionbar
          prevWorldSettings={isRemote ? remoteWorldSettings : prevWorldSettings}
          worldSettings={worldSettings}
          setWorldSettings={setWorldSettings}
          readOnly={readOnly}
        />
      </div>
    </RemoteUnsupportedGuard>
  );
}
