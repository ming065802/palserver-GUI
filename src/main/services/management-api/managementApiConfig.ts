import fsc from 'fs';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { APP_DATA_PATH } from '../../constant';
import {
  DEFAULT_MANAGEMENT_API_CONFIG,
  ManagementApiConfig,
} from '../../../types/ManagementApi.types';

export const MANAGEMENT_API_CONFIG_FILENAME = 'management-api.config.json';

export function getManagementApiConfigPath() {
  return path.join(APP_DATA_PATH, MANAGEMENT_API_CONFIG_FILENAME);
}

function normalizePort(port: unknown) {
  const resolved = Number(port);
  if (!Number.isInteger(resolved) || resolved < 1 || resolved > 65535) {
    return DEFAULT_MANAGEMENT_API_CONFIG.port;
  }
  return resolved;
}

function normalizeBindAddress(bindAddress: unknown) {
  if (typeof bindAddress !== 'string' || !bindAddress.trim()) {
    return DEFAULT_MANAGEMENT_API_CONFIG.bindAddress;
  }
  return bindAddress.trim();
}

export function normalizeManagementApiConfig(
  input: Partial<ManagementApiConfig> = {},
): ManagementApiConfig {
  const enabled = Boolean(input.enabled);
  const bindAddress = normalizeBindAddress(input.bindAddress);
  const port = normalizePort(input.port);
  let apiKey = typeof input.apiKey === 'string' ? input.apiKey.trim() : '';

  if (enabled && bindAddress !== '127.0.0.1' && !apiKey) {
    apiKey = crypto.randomBytes(24).toString('hex');
  }

  return {
    enabled,
    port,
    bindAddress,
    apiKey,
  };
}

export function readManagementApiConfig(): ManagementApiConfig {
  const configPath = getManagementApiConfigPath();

  if (!fsc.existsSync(configPath)) {
    return { ...DEFAULT_MANAGEMENT_API_CONFIG };
  }

  try {
    const content = fsc.readFileSync(configPath, { encoding: 'utf-8' });
    return normalizeManagementApiConfig(JSON.parse(content));
  } catch {
    return { ...DEFAULT_MANAGEMENT_API_CONFIG };
  }
}

export async function writeManagementApiConfig(
  config: Partial<ManagementApiConfig>,
) {
  const normalized = normalizeManagementApiConfig({
    ...readManagementApiConfig(),
    ...config,
  });

  await fs.mkdir(APP_DATA_PATH, { recursive: true });
  await fs.writeFile(
    getManagementApiConfigPath(),
    JSON.stringify(normalized, null, 2),
    { encoding: 'utf-8' },
  );

  return normalized;
}

export function generateManagementApiKey() {
  return crypto.randomBytes(24).toString('hex');
}
