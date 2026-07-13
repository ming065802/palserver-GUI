import {
  ManagementApiErrorBody,
  ManagementApiServerStatus,
  PalworldPlayersResponse,
} from '../types';

export class ManagementApiClientError extends Error {
  readonly statusCode: number;

  readonly code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'ManagementApiClientError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

type RequestOptions = {
  baseUrl: string;
  apiKey: string;
};

async function parseErrorResponse(
  response: Response,
): Promise<ManagementApiClientError> {
  let body: ManagementApiErrorBody = {};

  try {
    body = (await response.json()) as ManagementApiErrorBody;
  } catch {
    //
  }

  const message =
    body.message ||
    body.error ||
    `Management API request failed (${response.status})`;

  return new ManagementApiClientError(response.status, message, body.code);
}

async function request<T>(
  options: RequestOptions,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.apiKey) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }

  let response: Response;

  try {
    response = await fetch(`${options.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new ManagementApiClientError(
      0,
      `無法連線至 Management API（${options.baseUrl}）：${message}`,
    );
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json() as Promise<T>;
}

export function createManagementApiClient(options: RequestOptions) {
  return {
    getHealth() {
      return request<{ ok: boolean; enabled: boolean }>(
        options,
        'GET',
        '/api/health',
      );
    },

    listServers() {
      return request<{ servers: ManagementApiServerStatus[] }>(
        options,
        'GET',
        '/api/servers',
      );
    },

    getServerStatus(serverId: string) {
      return request<ManagementApiServerStatus>(
        options,
        'GET',
        `/api/servers/${encodeURIComponent(serverId)}/status`,
      );
    },

    startServer(serverId: string) {
      return request<Record<string, unknown>>(
        options,
        'POST',
        `/api/servers/${encodeURIComponent(serverId)}/start`,
      );
    },

    stopServer(
      serverId: string,
      payload: { waitMinutes?: number; message?: string } = {},
    ) {
      return request<ManagementApiServerStatus>(
        options,
        'POST',
        `/api/servers/${encodeURIComponent(serverId)}/stop`,
        payload,
      );
    },

    restartServer(
      serverId: string,
      payload: { waitMinutes?: number; message?: string } = {},
    ) {
      return request<Record<string, unknown>>(
        options,
        'POST',
        `/api/servers/${encodeURIComponent(serverId)}/restart`,
        payload,
      );
    },

    getServerPlayers(serverId: string) {
      return request<PalworldPlayersResponse>(
        options,
        'GET',
        `/api/servers/${encodeURIComponent(serverId)}/players`,
      );
    },

    announceServer(serverId: string, message: string) {
      return request<{ serverId: string; message: string; announced: boolean }>(
        options,
        'POST',
        `/api/servers/${encodeURIComponent(serverId)}/announce`,
        { message },
      );
    },
  };
}

export type ManagementApiClient = ReturnType<typeof createManagementApiClient>;

export function formatManagementApiError(error: unknown): string {
  if (error instanceof ManagementApiClientError) {
    if (error.statusCode === 501) {
      if (error.code === 'REMOTE_START_NOT_SUPPORTED') {
        return '遠端伺服器實例無法透過 Management API 啟動。請在本機 GUI 或遠端主機上操作。';
      }
      if (error.code === 'REMOTE_RESTART_NOT_SUPPORTED') {
        return '遠端伺服器實例無法透過 Management API 重啟。請在本機 GUI 或遠端主機上操作。';
      }
      return error.message;
    }

    if (error.statusCode === 401) {
      return 'Management API 驗證失敗，請確認 API 金鑰是否正確。';
    }

    if (error.statusCode === 409 && error.code === 'SERVER_NOT_RUNNING') {
      return '伺服器目前未運行，無法查詢玩家或發送廣播。';
    }

    if (error.statusCode === 503) {
      if (error.code === 'REST_API_DISABLED') {
        return '此伺服器未啟用 Palworld REST API，請於世界設定中開啟。';
      }
      if (error.code === 'REST_NOT_REACHABLE') {
        return '無法連線至 Palworld REST API，請確認伺服器已啟動且 REST 埠可達。';
      }
    }

    if (error.statusCode === 0) {
      return `${error.message}\n請確認 GUI 已啟動且本機 Management API 已啟用。`;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '發生未知錯誤';
}
