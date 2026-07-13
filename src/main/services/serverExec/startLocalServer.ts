import path from 'path';
import { spawn } from 'child_process';
import fsc from 'fs';
import fs from 'fs/promises';
import { TEMPLATE_PATH, USER_SERVER_INSTANCES_PATH } from '../../constant';
import readWorldSettingsini from '../worldSettings/readWorldSettingsini';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import loadUE4SSTemplate from '../templates/loadUE4SSTemplate';
import loadPalguardTemplate from '../templates/loadPalguardTemplate';
import {
  notifyServerExited,
  notifyServerStarted,
} from './serverProcessEvents';
import {
  registerRunningServer,
  unregisterRunningServer,
  allocateQueryPort,
  getRunningServer,
} from './runningServersRegistry';

export async function prepareLocalServer(serverId: string) {
  const serverInfo = await getServerInfoByServerId(serverId);
  const serverPath = path.join(
    USER_SERVER_INSTANCES_PATH,
    serverId,
    'server',
  );
  const binariesWin64Path = path.join(serverPath, 'Pal/Binaries/Win64');

  const ue4ssEnabled = serverInfo.ue4ssEnabled;
  const ue4ssPath = path.join(binariesWin64Path, 'UE4SS.dll');
  const ue4ssDisabledPath = path.join(
    binariesWin64Path,
    'UE4SS.disabled.dll',
  );

  if (fsc.existsSync(ue4ssDisabledPath)) {
    if (ue4ssEnabled) {
      fsc.renameSync(ue4ssDisabledPath, ue4ssPath);
    }
  } else if (fsc.existsSync(ue4ssPath)) {
    if (!ue4ssEnabled) {
      fsc.renameSync(ue4ssPath, ue4ssDisabledPath);
    }
  } else if (ue4ssEnabled) {
    loadUE4SSTemplate(path.join(serverPath, 'Pal/Binaries/Win64'));
  }

  const palguardEnabled = serverInfo.palguardEnabled;
  const palguardPath = path.join(binariesWin64Path, 'PalDefender.dll');
  const palguardDisabledPath = path.join(
    binariesWin64Path,
    'PalDefender.disabled.dll',
  );

  if (fsc.existsSync(palguardDisabledPath)) {
    if (palguardEnabled) {
      fsc.renameSync(palguardDisabledPath, palguardPath);
    }
  } else if (fsc.existsSync(palguardPath)) {
    if (!palguardEnabled) {
      fsc.renameSync(palguardPath, palguardDisabledPath);
    }
  } else if (palguardEnabled) {
    loadPalguardTemplate(path.join(serverPath, 'Pal/Binaries/Win64'));
  }

  if (serverInfo.performanceOptimizationEnabled) {
    await fs.copyFile(
      path.join(TEMPLATE_PATH, 'Config/Engine.ini/opt/Engine.ini'),
      path.join(serverPath, 'Pal/Saved/Config/WindowsServer/Engine.ini'),
    );
  } else {
    await fs.copyFile(
      path.join(TEMPLATE_PATH, 'Config/Engine.ini/pure/Engine.ini'),
      path.join(serverPath, 'Pal/Saved/Config/WindowsServer/Engine.ini'),
    );
  }
}

export async function spawnLocalServer(
  serverId: string,
  queryPort: number,
  useIndependentProcess?: boolean,
) {
  const serverInfo = await getServerInfoByServerId(serverId);
  const serverPath = path.join(USER_SERVER_INSTANCES_PATH, serverId, 'server');
  const worldSettingsPath = path.join(
    serverPath,
    'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
  );
  const worldSettings = await readWorldSettingsini(worldSettingsPath);
  const independentProcess =
    useIndependentProcess ?? serverInfo.UseIndependentProcess;

  const palserver = path.join(
    serverPath,
    independentProcess
      ? 'PalServer.exe'
      : 'Pal/Binaries/Win64/PalServer-Win64-Shipping.exe',
  );

  const palserverStream = spawn(palserver, [
    `-RCONPort=${worldSettings.RCONPort}`,
    `-port=${worldSettings.PublicPort}`,
    `-publicport=${worldSettings.PublicPort}`,
    `-publicip=${worldSettings.PublicIP}`,
    `-QueryPort=${queryPort}`,
    serverInfo.openToCommunity ? '-publiclobby' : '',
    serverInfo.performanceOptimizationEnabled ? '-useperfthreads' : '',
    serverInfo.performanceOptimizationEnabled ? '-NoAsyncLoadingThread' : '',
    serverInfo.performanceOptimizationEnabled ? '-UseMultithreadForDS' : '',
  ]);

  const processId = palserverStream.pid as number;

  const handleExit = () => {
    unregisterRunningServer(serverId);
    notifyServerExited(serverId, processId);
  };

  palserverStream.on('spawn', () => {
    registerRunningServer(serverId, processId, queryPort);
    notifyServerStarted(serverId, processId, queryPort);
  });

  palserverStream.on('exit', handleExit);
  palserverStream.on('close', handleExit);
  palserverStream.on('disconnect', handleExit);
  palserverStream.on('error', handleExit);

  return processId;
}

export async function startLocalServer(serverId: string, queryPort?: number) {
  const resolvedQueryPort =
    queryPort ?? getRunningServer(serverId)?.queryPort ?? allocateQueryPort();
  await prepareLocalServer(serverId);
  return spawnLocalServer(serverId, resolvedQueryPort);
}
