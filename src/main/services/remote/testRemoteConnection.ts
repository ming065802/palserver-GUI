import axios from 'axios';
import trimWorldSettingsString from '../../../utils/trimWorldSettingsString';
import {
  RemoteConnectionErrorCode,
  RemoteConnectionTestInput,
  RemoteConnectionTestResult,
} from '../../../types/RemoteConnection.types';

export function normalizeRemoteHost(host: string) {
  return host.trim();
}

export function classifyRemoteConnectionError(
  error: unknown,
): Pick<RemoteConnectionTestResult, 'error' | 'errorCode'> {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return {
        errorCode: 'AUTH_FAILED',
        error: 'Admin password is incorrect',
      };
    }

    if (status === 404) {
      return {
        errorCode: 'REST_DISABLED',
        error: 'REST API endpoint was not found on the remote server',
      };
    }

    if (error.code === 'ENOTFOUND') {
      return {
        errorCode: 'CONNECTION_FAILED',
        error: 'Unable to resolve the remote host name',
      };
    }

    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'EHOSTUNREACH' ||
      error.code === 'ECONNABORTED'
    ) {
      return {
        errorCode: 'CONNECTION_FAILED',
        error: 'Unable to reach the remote REST API port',
      };
    }

    if (error.message) {
      return {
        errorCode: 'CONNECTION_FAILED',
        error: error.message,
      };
    }
  }

  if (error instanceof Error && error.message) {
    return {
      errorCode: 'CONNECTION_FAILED',
      error: error.message,
    };
  }

  return {
    errorCode: 'CONNECTION_FAILED',
    error: 'Unable to connect to the remote server',
  };
}

export default async function testRemoteConnection(
  input: RemoteConnectionTestInput,
): Promise<RemoteConnectionTestResult> {
  const host = normalizeRemoteHost(input.host);

  if (!host) {
    return {
      ok: false,
      errorCode: 'INVALID_HOST',
      error: 'Remote host is required',
    };
  }

  const restPort = Number(input.restPort) || 8212;
  const adminPassword = trimWorldSettingsString(input.adminPassword);

  try {
    const result = await axios(`http://${host}:${restPort}/v1/api/info`, {
      method: 'get',
      timeout: 10000,
      auth: {
        username: 'admin',
        password: adminPassword,
      },
    });

    return {
      ok: true,
      info: result.data,
    };
  } catch (error) {
    return {
      ok: false,
      ...classifyRemoteConnectionError(error),
    };
  }
}
