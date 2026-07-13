export type ManagementApiConfig = {
  enabled: boolean;
  port: number;
  bindAddress: string;
  apiKey: string;
};

export const DEFAULT_MANAGEMENT_API_CONFIG: ManagementApiConfig = {
  enabled: false,
  port: 3435,
  bindAddress: '127.0.0.1',
  apiKey: '',
};

export type ManagementApiServerStatus = {
  serverId: string;
  isRemote: boolean;
  running: boolean;
  processId?: number;
  queryPort?: number;
  serverName?: string;
  restReachable?: boolean;
};

export type ManagementApiErrorCode =
  | 'SERVER_NOT_FOUND'
  | 'REMOTE_START_NOT_SUPPORTED'
  | 'REMOTE_RESTART_NOT_SUPPORTED'
  | 'SERVER_ALREADY_RUNNING'
  | 'SERVER_NOT_RUNNING'
  | 'REST_API_DISABLED'
  | 'REST_NOT_REACHABLE'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST';
