import { AlertDialog, Button, Callout, Flex, TextField } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import _ from 'lodash';
import Channels from '../../../../main/ipcs/channels';
import SecureEye from '../../SecureEye';
import { SERVER_URL } from '../../../../constant/app';
import Link from '../../Link';
import {
  RemoteConnectionErrorCode,
  RemoteConnectionTestResult,
} from '../../../../types/RemoteConnection.types';

type FieldOption = {
  id: string;
  value: string;
  secure?: boolean;
  showValue?: boolean;
  required?: boolean;
};

const defaultServerConfigOptions: Record<string, FieldOption> = {
  serverName: {
    id: 'ServerName',
    value: '',
    required: true,
  },
  publicIP: {
    id: 'PublicIP',
    value: '',
    required: true,
  },
  restApiPort: {
    id: 'RESTAPIPort',
    value: '8212',
    required: true,
  },
  rconPort: {
    id: 'RCONPort',
    value: '25575',
    required: false,
  },
  adminPassword: {
    id: 'AdminPassword',
    value: '',
    secure: true,
    showValue: false,
    required: true,
  },
};

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

function getConnectionErrorKey(errorCode?: RemoteConnectionErrorCode) {
  switch (errorCode) {
    case 'INVALID_HOST':
      return 'RemoteConnectionInvalidHost';
    case 'AUTH_FAILED':
      return 'RemoteConnectionAuthFailed';
    case 'REST_DISABLED':
      return 'RemoteConnectionRestDisabled';
    case 'CONNECTION_FAILED':
    default:
      return 'RemoteConnectionFailed';
  }
}

export default function CreateRemoteServerAlert() {
  const { t, language } = useTranslation();

  const [serverConfigOptions, setServerConfigOptions] = useState(
    defaultServerConfigOptions,
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  const requiredFieldsFilled = useMemo(
    () =>
      Boolean(
        serverConfigOptions.serverName.value.trim() &&
          serverConfigOptions.publicIP.value.trim() &&
          serverConfigOptions.restApiPort.value.trim() &&
          serverConfigOptions.adminPassword.value,
      ),
    [serverConfigOptions],
  );

  const resetConnectionStatus = () => {
    setConnectionStatus('idle');
    setConnectionMessage('');
  };

  const updateField = (key: string, option: FieldOption, value: string) => {
    setServerConfigOptions({
      ...serverConfigOptions,
      [key]: { ...option, value },
    });
    resetConnectionStatus();
  };

  const getConnectionPayload = () => ({
    host: serverConfigOptions.publicIP.value.trim(),
    restPort: Number(serverConfigOptions.restApiPort.value) || 8212,
    adminPassword: serverConfigOptions.adminPassword.value,
  });

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionMessage('');

    const result: RemoteConnectionTestResult =
      await window.electron.ipcRenderer.invoke(
        Channels.testRemoteConnection,
        getConnectionPayload(),
      );

    if (result.ok) {
      setConnectionStatus('success');
      setConnectionMessage(t('RemoteConnectionSuccess'));
      return;
    }

    setConnectionStatus('error');
    setConnectionMessage(
      result.errorCode
        ? t(getConnectionErrorKey(result.errorCode))
        : result.error || t('RemoteConnectionFailed'),
    );
  };

  const handleCreateServer = async () => {
    await window.electron.ipcRenderer.invoke(
      Channels.createRemoteServerInstance,
      {
        ServerName: serverConfigOptions.serverName.value.trim(),
        PublicIP: serverConfigOptions.publicIP.value.trim(),
        RESTAPIPort: Number(serverConfigOptions.restApiPort.value) || 8212,
        RCONPort: Number(serverConfigOptions.rconPort.value) || 25575,
        AdminPassword: serverConfigOptions.adminPassword.value,
        RCONEnabled: false,
      },
    );
  };

  return (
    <AlertDialog.Content style={{ maxWidth: 450 }}>
      <AlertDialog.Title>{t('CreateRemoteServer')}</AlertDialog.Title>
      <AlertDialog.Description size="2" mb="3">
        {t('CreateRemoteServerDesc')}
      </AlertDialog.Description>

      <div className="flex flex-col w-[78%] pb-2">
        {_.map(serverConfigOptions, (option, key) => (
          <div
            key={key}
            className="w-full my-2 flex gap-2 items-center justify-between relative"
          >
            <span>{t(option.id)}：</span>
            <TextField.Root
              type={option.secure && !option.showValue ? 'password' : 'text'}
              placeholder=""
              value={option.value}
              onChange={(e) => {
                updateField(key, option, e.target.value);
              }}
            />
            {option.secure && (
              <div className="absolute -right-12">
                <SecureEye
                  open={option.showValue}
                  onOpenChange={(open) => {
                    setServerConfigOptions({
                      ...serverConfigOptions,
                      [key]: { ...option, showValue: open },
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        appearance="dark"
        href={`${SERVER_URL}/data/links/${language}/HowToGetIPAdress`}
      >
        {t('HowToGetIPAdress')}
      </Link>

      {connectionStatus === 'success' && (
        <Callout.Root color="green" mt="3">
          <Callout.Text>{connectionMessage}</Callout.Text>
        </Callout.Root>
      )}
      {connectionStatus === 'error' && (
        <Callout.Root color="red" mt="3">
          <Callout.Text>{connectionMessage}</Callout.Text>
        </Callout.Root>
      )}

      <Flex gap="3" mt="4" justify="between" align="center">
        <Button
          variant="soft"
          disabled={!requiredFieldsFilled || connectionStatus === 'testing'}
          onClick={handleTestConnection}
        >
          {connectionStatus === 'testing'
            ? t('TestingConnection')
            : t('TestConnection')}
        </Button>

        <Flex gap="3">
          <AlertDialog.Cancel>
            <Button
              variant="soft"
              color="gray"
              onClick={() => {
                setServerConfigOptions(defaultServerConfigOptions);
                resetConnectionStatus();
              }}
            >
              {t('Cancel')}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              disabled={
                !requiredFieldsFilled || connectionStatus !== 'success'
              }
              onClick={handleCreateServer}
              variant="solid"
              color="yellow"
            >
              {t('Create')}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </Flex>

      {requiredFieldsFilled && connectionStatus !== 'success' && (
        <p className="text-xs text-gray-11 mt-2">{t('RemoteConnectionTestRequired')}</p>
      )}
    </AlertDialog.Content>
  );
}
