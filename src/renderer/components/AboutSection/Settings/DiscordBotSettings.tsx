import { Button, Select, Switch, Text, TextField } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import Channels from '../../../../main/ipcs/channels';
import {
  DiscordBotConfig,
  DiscordBotStatus,
} from '../../../../types/DiscordBot.types';
import { ManagementApiConfig } from '../../../../types/ManagementApi.types';
import { ServerInstanceSetting } from '../../../../types/ServerInstanceSetting.types';

const MASKED = '********';

const DEFAULT_CONFIG: DiscordBotConfig = {
  enabled: false,
  discord: {
    token: '',
    clientId: '',
    guildId: '',
    allowedRoleIds: [],
    allowedUserIds: [],
  },
  managementApi: {
    baseUrl: 'http://127.0.0.1:3435',
    apiKey: '',
  },
  defaultServerId: '',
  dangerousCommandsRequireAdmin: true,
};

function parseIdList(value: string) {
  return value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DiscordBotSettings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<DiscordBotConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<DiscordBotStatus>({
    running: false,
    lastError: null,
    pid: null,
  });
  const [managementApi, setManagementApi] = useState<ManagementApiConfig>({
    enabled: false,
    port: 3435,
    bindAddress: '127.0.0.1',
    apiKey: '',
  });
  const [servers, setServers] = useState<ServerInstanceSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [roleIdsText, setRoleIdsText] = useState('');
  const [userIdsText, setUserIdsText] = useState('');

  useEffect(() => {
    Promise.all([
      window.electron.ipcRenderer.invoke(Channels.getDiscordBotConfig),
      window.electron.ipcRenderer.invoke(Channels.getManagementApiConfig),
      window.electron.ipcRenderer.invoke(Channels.getAllServerInfo),
    ])
      .then(([botPayload, mgmtConfig, allServers]) => {
        const nextConfig = {
          ...DEFAULT_CONFIG,
          ...botPayload.config,
        };
        setConfig(nextConfig);
        setStatus(botPayload.status);
        setManagementApi(mgmtConfig);
        setServers(allServers);
        setRoleIdsText(nextConfig.discord.allowedRoleIds.join(', '));
        setUserIdsText(nextConfig.discord.allowedUserIds.join(', '));
      })
      .catch(() => {
        //
      });
  }, []);

  const updateConfig = (patch: Partial<DiscordBotConfig>) => {
    setConfig((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = await window.electron.ipcRenderer.invoke(
        Channels.setDiscordBotConfig,
        {
          enabled: config.enabled,
          defaultServerId: config.defaultServerId,
          dangerousCommandsRequireAdmin: config.dangerousCommandsRequireAdmin,
          discord: {
            token:
              config.discord.token === MASKED ? undefined : config.discord.token,
            clientId: config.discord.clientId,
            guildId: config.discord.guildId,
            allowedRoleIds: parseIdList(roleIdsText),
            allowedUserIds: parseIdList(userIdsText),
          },
        },
      );
      setConfig({ ...DEFAULT_CONFIG, ...payload.config });
      setStatus(payload.status);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const managementApiWarning =
    config.enabled && !managementApi.enabled
      ? t('DiscordBotManagementApiWarning')
      : null;

  return (
    <div className="rounded-lg border border-white/10 p-4 flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Text weight="bold">{t('DiscordBotTitle')}</Text>
          <Text color="gray" size="2">
            {t('DiscordBotDesc')}
          </Text>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => updateConfig({ enabled })}
        />
      </div>

      {managementApiWarning && (
        <Text color="amber" size="2">
          {managementApiWarning}
        </Text>
      )}

      {status.running && (
        <Text color="green" size="2">
          {t('DiscordBotRunning')} (PID: {status.pid ?? '—'})
        </Text>
      )}

      {status.lastError && (
        <Text color="red" size="2">
          {t('DiscordBotLastError')}: {status.lastError}
        </Text>
      )}

      <div className="grid gap-3">
        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotToken')}</Text>
          <TextField.Root
            type="password"
            value={config.discord.token}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                discord: { ...current.discord, token: event.target.value },
              }))
            }
            placeholder={t('DiscordBotTokenPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotClientId')}</Text>
          <TextField.Root
            value={config.discord.clientId}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                discord: { ...current.discord, clientId: event.target.value },
              }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotGuildId')}</Text>
          <TextField.Root
            value={config.discord.guildId}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                discord: { ...current.discord, guildId: event.target.value },
              }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotAllowedRoleIds')}</Text>
          <TextField.Root
            value={roleIdsText}
            onChange={(event) => setRoleIdsText(event.target.value)}
            placeholder={t('DiscordBotIdListPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotAllowedUserIds')}</Text>
          <TextField.Root
            value={userIdsText}
            onChange={(event) => setUserIdsText(event.target.value)}
            placeholder={t('DiscordBotIdListPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('DiscordBotDefaultServerId')}</Text>
          <Select.Root
            value={config.defaultServerId || undefined}
            onValueChange={(defaultServerId) => updateConfig({ defaultServerId })}
          >
            <Select.Trigger placeholder={t('DiscordBotDefaultServerPlaceholder')} />
            <Select.Content>
              {servers.map((server) => (
                <Select.Item key={server.serverId} value={server.serverId}>
                  {server.serverId}
                  {server.isRemote ? ` (${t('RemoteServerBadge')})` : ''}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </label>
      </div>

      <Text color="gray" size="2">
        {t('DiscordBotSecurityNote')}
      </Text>

      <div className="flex items-center gap-3">
        <Button color="yellow" onClick={handleSave} disabled={saving}>
          {saving ? t('DiscordBotSaving') : t('DiscordBotSave')}
        </Button>
        {saved && (
          <Text color="green" size="2">
            {t('DiscordBotSaved')}
          </Text>
        )}
      </div>
    </div>
  );
}
