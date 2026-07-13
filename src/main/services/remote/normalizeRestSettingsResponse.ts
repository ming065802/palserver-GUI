const REST_SETTINGS_KEY_ALIASES: Record<string, string> = {
  AllowConnectPlatform: 'CrossplayPlatforms',
};

const QUOTED_STRING_KEYS = new Set([
  'ServerName',
  'ServerDescription',
  'ServerPassword',
  'AdminPassword',
  'Region',
  'PublicIP',
]);

function coerceBoolean(value: unknown): boolean | unknown {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return value;
}

function coerceNumber(value: unknown): number | unknown {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return value;
}

function normalizeSettingValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (key.startsWith('b')) {
    return coerceBoolean(value);
  }

  if (typeof value === 'string' && QUOTED_STRING_KEYS.has(key)) {
    const trimmed = value.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) {
    return coerceNumber(value);
  }

  return value;
}

function resolveSettingKey(key: string): string {
  return REST_SETTINGS_KEY_ALIASES[key] || key;
}

export type NormalizeRestSettingsResult = {
  settings: Record<string, unknown>;
  unknownKeys: string[];
};

export default function normalizeRestSettingsResponse(
  response: unknown,
  knownKeys?: Set<string>,
): NormalizeRestSettingsResult {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return { settings: {}, unknownKeys: [] };
  }

  const source = response as Record<string, unknown>;
  const settings: Record<string, unknown> = {};
  const unknownKeys: string[] = [];

  Object.entries(source).forEach(([rawKey, rawValue]) => {
    const key = resolveSettingKey(rawKey);
    settings[key] = normalizeSettingValue(key, rawValue);

    if (knownKeys && !knownKeys.has(key)) {
      unknownKeys.push(rawKey);
    }
  });

  return {
    settings,
    unknownKeys,
  };
}
