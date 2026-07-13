import { useEffect, useState } from 'react';
import useTranslation from '../../../../hooks/translation/useTranslation';
import Channels from '../../../../../main/ipcs/channels';
import useThisServerInfo from '../ServerInfoProvider/useThisServerInfo';
import {
  AlertDialog,
  Button,
  Flex,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes';
import _ from 'lodash';
import useThisWorldSettings from '../ServerInfoProvider/useThisWorldSettings';
import trimWorldSettingsString from '../../../../../utils/trimWorldSettingsString';
import SecureEye from '../../../SecureEye';
import useIsRunningServers from '../../../../redux/isRunningServers/useIsRunningServers';

const remoteFieldDefaults = {
  serverName: {
    id: 'ServerName',
    value: '',
    secure: false,
    showValue: true,
  },
  publicIP: {
    id: 'PublicIP',
    value: '',
    secure: false,
    showValue: true,
  },
  restApiPort: {
    id: 'RESTAPIPort',
    value: '',
    secure: false,
    showValue: true,
  },
  rconPort: {
    id: 'RCONPort',
    value: '',
    secure: false,
    showValue: true,
  },
  adminPassword: {
    id: 'AdminPassword',
    value: '',
    secure: true,
    showValue: false,
  },
};

export default function EditServerAlert() {
  const { t } = useTranslation();

  const { serverInfo } = useThisServerInfo();
  const { worldSettings } = useThisWorldSettings();
  const isRemote = Boolean(serverInfo?.isRemote);

  const { includeRunningServers } = useIsRunningServers();
  const isServerRunning = includeRunningServers(serverInfo?.serverId!);

  const [serverConfigOptions, setServerConfigOptions] = useState({
    serverName: {
      id: 'ServerName',
      value: '',
      secure: false,
      showValue: true,
    },
    publicIP: {
      id: 'PublicIP',
      value: '',
      secure: true,
      showValue: false,
    },
    publicPort: {
      id: 'PublicPort',
      value: '',
      secure: false,
      showValue: true,
    },
    serverPassword: {
      id: 'ServerPassword',
      value: '',
      secure: true,
      showValue: false,
    },
    adminPassword: {
      id: 'AdminPassword',
      value: '',
      secure: true,
      showValue: false,
    },
  });

  const [remoteConfigOptions, setRemoteConfigOptions] = useState(
    remoteFieldDefaults,
  );
  const [remoteOnlineMapEnabled, setRemoteOnlineMapEnabled] = useState(false);

  useEffect(() => {
    if (!isRemote) {
      return;
    }

    setRemoteConfigOptions({
      serverName: {
        ...remoteFieldDefaults.serverName,
        value: trimWorldSettingsString(worldSettings.ServerName) || '',
      },
      publicIP: {
        ...remoteFieldDefaults.publicIP,
        value:
          serverInfo?.remoteHost ||
          trimWorldSettingsString(worldSettings.PublicIP) ||
          '',
      },
      restApiPort: {
        ...remoteFieldDefaults.restApiPort,
        value: String(
          serverInfo?.remoteRestPort || worldSettings.RESTAPIPort || 8212,
        ),
      },
      rconPort: {
        ...remoteFieldDefaults.rconPort,
        value: String(
          serverInfo?.remoteRconPort || worldSettings.RCONPort || 25575,
        ),
      },
      adminPassword: {
        ...remoteFieldDefaults.adminPassword,
        value: '',
      },
    });
    setRemoteOnlineMapEnabled(Boolean(serverInfo?.OnlineMapEnabled));
  }, [isRemote, serverInfo, worldSettings]);

  const handleEditServer = async () => {
    if (isRemote) {
      await window.electron.ipcRenderer.invoke(
        Channels.editRemoteServerInstance,
        serverInfo?.serverId,
        {
          ServerName: remoteConfigOptions.serverName.value.trim() || undefined,
          PublicIP: remoteConfigOptions.publicIP.value.trim() || undefined,
          RESTAPIPort: remoteConfigOptions.restApiPort.value
            ? Number(remoteConfigOptions.restApiPort.value)
            : undefined,
          RCONPort: remoteConfigOptions.rconPort.value
            ? Number(remoteConfigOptions.rconPort.value)
            : undefined,
          AdminPassword: remoteConfigOptions.adminPassword.value || undefined,
          OnlineMapEnabled: remoteOnlineMapEnabled,
        },
      );
      return;
    }

    await window.electron.ipcRenderer.invoke(
      Channels.editServerInstance,
      serverInfo?.serverId,
      {
        ServerName: serverConfigOptions.serverName.value
          ? `"${serverConfigOptions.serverName.value}"`
          : worldSettings.ServerName,
        PublicIP: serverConfigOptions.publicIP.value
          ? `"${serverConfigOptions.publicIP.value}"`
          : worldSettings.PublicIP,
        PublicPort:
          serverConfigOptions.publicPort.value || worldSettings.PublicPort,
        ServerPassword: serverConfigOptions.serverPassword.value
          ? `"${serverConfigOptions.serverPassword.value}"`
          : worldSettings.ServerPassword,
        AdminPassword: serverConfigOptions.adminPassword.value
          ? `"${serverConfigOptions.adminPassword.value}"`
          : worldSettings.AdminPassword,
      },
    );
  };

  const activeOptions = isRemote ? remoteConfigOptions : serverConfigOptions;
  const setActiveOptions = isRemote
    ? setRemoteConfigOptions
    : setServerConfigOptions;

  return (
    <AlertDialog.Content style={{ maxWidth: 450 }}>
      <AlertDialog.Title>
        {isRemote ? t('EditRemoteServer') : t('EditServer')}{' '}
        {!isRemote && isServerRunning && `(${t('PlzCloseServerFirst')})`}
      </AlertDialog.Title>
      <div className="flex flex-col w-[78%]">
        {_.map(activeOptions, (option, key) => (
          <div
            key={key}
            className="w-full my-2 flex gap-2 items-center justify-between relative"
          >
            <span>{t(option.id)}：</span>
            <TextField.Root
              disabled={!isRemote && isServerRunning}
              type={option.showValue ? 'text' : 'password'}
              placeholder={
                option.secure && !option.showValue
                  ? trimWorldSettingsString(
                      worldSettings[option.id],
                    )?.replaceAll(/./gu, '•')
                  : trimWorldSettingsString(worldSettings[option.id])
              }
              value={option.value}
              onChange={(e) => {
                setActiveOptions({
                  ...activeOptions,
                  ...{ [key]: { ...option, value: e.target.value } },
                });
              }}
            />
            {option.secure && (
              <div className="absolute -right-12">
                <SecureEye
                  open={option?.showValue}
                  onOpenChange={(o) => {
                    setActiveOptions({
                      ...activeOptions,
                      ...{ [key]: { ...option, showValue: o } },
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}
        {isRemote && (
          <div className="w-full my-2 flex gap-2 items-center justify-between">
            <div>
              <Text as="div" size="2" weight="medium">
                {t('OnlineMap')}
              </Text>
              <Text as="div" size="1" color="gray">
                {t('OnlineMapDesc')}
              </Text>
            </div>
            <Switch
              checked={remoteOnlineMapEnabled}
              onCheckedChange={setRemoteOnlineMapEnabled}
            />
          </div>
        )}
      </div>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            {t('Cancel')}
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button onClick={handleEditServer} variant="solid" color="yellow">
            {t('Confirm')}
          </Button>
        </AlertDialog.Action>
      </Flex>
    </AlertDialog.Content>
  );
}
