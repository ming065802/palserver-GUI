import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import normalizeRestSettingsResponse from '../../../../main/services/remote/normalizeRestSettingsResponse';
import { worldSettingsOptions } from '../../../components/WorldSettings/settings';

const REMOTE_SETTINGS_CACHE_MS = 60_000;

const knownWorldSettingKeys = new Set(Object.keys(worldSettingsOptions));

export default function useRemoteWorldSettings(serverId: string) {
  const [worldSettings, setWorldSettings] = useState<Record<string, unknown>>({});
  const [unknownKeys, setUnknownKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{
    serverId: string;
    fetchedAt: number;
    settings: Record<string, unknown>;
    unknownKeys: string[];
  } | null>(null);

  const applyResponse = useCallback((response: unknown) => {
    const { settings, unknownKeys: extraKeys } = normalizeRestSettingsResponse(
      response,
      knownWorldSettingKeys,
    );
    setWorldSettings(settings);
    setUnknownKeys(extraKeys);
    setError(null);
    return { settings, unknownKeys: extraKeys };
  }, []);

  const fetchSettings = useCallback(
    async (force = false) => {
      if (!serverId) {
        return;
      }

      const cached = cacheRef.current;
      if (
        !force &&
        cached &&
        cached.serverId === serverId &&
        Date.now() - cached.fetchedAt < REMOTE_SETTINGS_CACHE_MS
      ) {
        setWorldSettings(cached.settings);
        setUnknownKeys(cached.unknownKeys);
        setError(null);
        return;
      }

      setLoading(true);

      try {
        const response = await window.electron.ipcRenderer.invoke(
          Channels.sendRestAPI,
          serverId,
          '/settings',
        );
        const normalized = applyResponse(response);
        cacheRef.current = {
          serverId,
          fetchedAt: Date.now(),
          settings: normalized.settings,
          unknownKeys: normalized.unknownKeys,
        };
      } catch (fetchError) {
        console.log(fetchError);
        setError('fetch_failed');
        if (!cacheRef.current || cacheRef.current.serverId !== serverId) {
          setWorldSettings({});
          setUnknownKeys([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [applyResponse, serverId],
  );

  useEffect(() => {
    cacheRef.current = null;
    setWorldSettings({});
    setUnknownKeys([]);
    setError(null);
    fetchSettings();
  }, [fetchSettings, serverId]);

  const hasUnknownKeys = useMemo(() => unknownKeys.length > 0, [unknownKeys]);

  return {
    worldSettings,
    unknownKeys,
    hasUnknownKeys,
    loading,
    error,
    refetch: () => fetchSettings(true),
  };
}
