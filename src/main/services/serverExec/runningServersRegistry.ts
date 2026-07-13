type RunningServer = {
  processId: number;
  queryPort: number;
};

const runningServers = new Map<string, RunningServer>();

export function registerRunningServer(
  serverId: string,
  processId: number,
  queryPort: number,
) {
  runningServers.set(serverId, { processId, queryPort });
}

export function unregisterRunningServer(serverId: string) {
  runningServers.delete(serverId);
}

export function isServerRunning(serverId: string) {
  return runningServers.has(serverId);
}

export function getRunningServer(serverId: string) {
  return runningServers.get(serverId);
}

export function getUsedQueryPorts() {
  return [...runningServers.values()].map((server) => server.queryPort);
}

export function allocateQueryPort() {
  const usedPorts = getUsedQueryPorts();
  let queryPort = 27015;

  while (usedPorts.includes(queryPort)) {
    queryPort = Number(
      `270${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
    );
  }

  return queryPort;
}
