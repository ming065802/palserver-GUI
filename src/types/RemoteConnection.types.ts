export type RemoteConnectionErrorCode =
  | 'INVALID_HOST'
  | 'CONNECTION_FAILED'
  | 'AUTH_FAILED'
  | 'REST_DISABLED';

export type RemoteConnectionTestInput = {
  host: string;
  restPort: number;
  adminPassword: string;
};

export type RemoteConnectionTestResult = {
  ok: boolean;
  error?: string;
  errorCode?: RemoteConnectionErrorCode;
  info?: unknown;
};

export type CreateRemoteServerInstanceInput = {
  ServerName: string;
  PublicIP: string;
  RESTAPIPort?: number;
  RCONPort?: number;
  AdminPassword: string;
  RCONEnabled?: boolean;
};
