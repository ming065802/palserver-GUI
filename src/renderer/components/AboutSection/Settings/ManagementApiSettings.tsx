import { Button, Switch, Text, TextField } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import Channels from '../../../../main/ipcs/channels';
import { ManagementApiConfig } from '../../../../types/ManagementApi.types';

const DEFAULT_CONFIG: ManagementApiConfig = {
  enabled: false,
  port: 3435,
  bindAddress: '127.0.0.1',
  apiKey: '',
};

export default function ManagementApiSettings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ManagementApiConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke(Channels.getManagementApiConfig)
      .then((value: ManagementApiConfig) => {
        setConfig({ ...DEFAULT_CONFIG, ...value });
      })
      .catch(() => {
        //
      });
  }, []);

  const updateConfig = (patch: Partial<ManagementApiConfig>) => {
    setConfig((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  const handleGenerateApiKey = async () => {
    const apiKey = await window.electron.ipcRenderer.invoke(
      Channels.generateManagementApiKey,
    );
    updateConfig({ apiKey });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextConfig = await window.electron.ipcRenderer.invoke(
        Channels.setManagementApiConfig,
        {
          enabled: config.enabled,
          port: Number(config.port),
          bindAddress: config.bindAddress,
          apiKey: config.apiKey,
        },
      );
      setConfig({ ...DEFAULT_CONFIG, ...nextConfig });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Text weight="bold">{t('ManagementApiTitle')}</Text>
          <Text color="gray" size="2">
            {t('ManagementApiDesc')}
          </Text>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => updateConfig({ enabled })}
        />
      </div>

      <div className="grid gap-3">
        <label className="flex flex-col gap-1">
          <Text size="2">{t('ManagementApiPort')}</Text>
          <TextField.Root
            type="number"
            value={String(config.port)}
            onChange={(event) =>
              updateConfig({ port: Number(event.target.value) || 3435 })
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('ManagementApiBindAddress')}</Text>
          <TextField.Root
            value={config.bindAddress}
            onChange={(event) =>
              updateConfig({ bindAddress: event.target.value })
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text size="2">{t('ManagementApiKey')}</Text>
          <div className="flex gap-2">
            <TextField.Root
              className="flex-1"
              value={config.apiKey}
              onChange={(event) => updateConfig({ apiKey: event.target.value })}
              placeholder={t('ManagementApiKeyPlaceholder')}
            />
            <Button variant="soft" onClick={handleGenerateApiKey}>
              {t('ManagementApiGenerateKey')}
            </Button>
          </div>
        </label>
      </div>

      <Text color="gray" size="2">
        {t('ManagementApiSecurityNote')}
      </Text>

      <div className="flex items-center gap-3">
        <Button color="yellow" onClick={handleSave} disabled={saving}>
          {saving ? t('ManagementApiSaving') : t('ManagementApiSave')}
        </Button>
        {saved && (
          <Text color="green" size="2">
            {t('ManagementApiSaved')}
          </Text>
        )}
      </div>
    </div>
  );
}
