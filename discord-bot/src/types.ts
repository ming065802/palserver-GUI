export type DiscordBotConfig = {
  enabled: boolean;
  discord: {
    token: string;
    clientId: string;
    guildId: string;
    allowedRoleIds: string[];
    allowedUserIds: string[];
  };
  managementApi: {
    baseUrl: string;
    apiKey: string;
  };
  defaultServerId: string;
  dangerousCommandsRequireAdmin: boolean;
};

export const DEFAULT_DISCORD_BOT_CONFIG: DiscordBotConfig = {
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

export type ManagementApiServerStatus = {
  serverId: string;
  isRemote: boolean;
  running: boolean;
  processId?: number;
  queryPort?: number;
  serverName?: string;
  restReachable?: boolean;
};

export type ManagementApiErrorBody = {
  error?: string;
  code?: string;
  message?: string;
};
