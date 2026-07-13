import fsc from 'fs';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../constant';
import {
  DailySchedule,
  getMsUntilNextOccurrence,
  normalizeDailySchedule,
} from '../../../types/DailySchedule.types';
import getServerInfoByServerId from '../serverInstanceSettings/getServerInfoByServerId';
import getWorldSettingsByServerId from '../worldSettings/getWorldSettingsByServerId';
import { isRestApiEnabled } from '../admin/restAdmin';
import { gracefulShutdownServer } from '../serverExec/gracefulShutdownServer';
import {
  allocateQueryPort,
  getRunningServer,
  isServerRunning,
} from '../serverExec/runningServersRegistry';
import { startLocalServer } from '../serverExec/startLocalServer';
import sleep from '../../../utils/sleep';

type ScheduleAction = 'stop' | 'start' | 'restart';

const timers = new Map<string, NodeJS.Timeout>();

function timerKey(serverId: string, action: ScheduleAction) {
  return `${serverId}:${action}`;
}

function clearScheduleTimer(serverId: string, action: ScheduleAction) {
  const key = timerKey(serverId, action);
  const timer = timers.get(key);
  if (timer) {
    clearTimeout(timer);
    timers.delete(key);
  }
}

function clearAllScheduleTimers(serverId: string) {
  (['stop', 'start', 'restart'] as ScheduleAction[]).forEach((action) => {
    clearScheduleTimer(serverId, action);
  });
}

async function canUseAdminApi(serverId: string) {
  const worldSettings = await getWorldSettingsByServerId(serverId);
  return (
    isRestApiEnabled(worldSettings) || Boolean(worldSettings.RCONEnabled)
  );
}

async function executeScheduledStop(
  serverId: string,
  schedule: DailySchedule,
) {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    if (!(await canUseAdminApi(serverId))) {
      return;
    }
    await gracefulShutdownServer(serverId, {
      waitMinutes: schedule.warningMinutes ?? 5,
      message: 'Scheduled server shutdown',
    });
    return;
  }

  if (!isServerRunning(serverId)) {
    return;
  }

  if (await canUseAdminApi(serverId)) {
    await gracefulShutdownServer(serverId, {
      waitMinutes: schedule.warningMinutes ?? 5,
      message: 'Scheduled server shutdown',
    });
    return;
  }

  const running = getRunningServer(serverId);
  if (running?.processId) {
    process.kill(running.processId);
  }
}

async function executeScheduledStart(serverId: string) {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote || isServerRunning(serverId)) {
    return;
  }

  const queryPort = allocateQueryPort();
  await startLocalServer(serverId, queryPort);
}

async function executeScheduledRestart(
  serverId: string,
  schedule: DailySchedule,
) {
  const serverInfo = await getServerInfoByServerId(serverId);

  if (serverInfo.isRemote) {
    if (isServerRunning(serverId) || (await canUseAdminApi(serverId))) {
      await gracefulShutdownServer(serverId, {
        waitMinutes: schedule.warningMinutes ?? 5,
        message: 'Scheduled server restart',
      });
    }
    return;
  }

  const running = getRunningServer(serverId);
  const queryPort = running?.queryPort ?? allocateQueryPort();

  if (isServerRunning(serverId)) {
    if (await canUseAdminApi(serverId)) {
      await gracefulShutdownServer(serverId, {
        waitMinutes: schedule.warningMinutes ?? 5,
        message: 'Scheduled server restart',
      });
    } else if (running?.processId) {
      process.kill(running.processId);
    }

    await sleep(5000);
  }

  if (!isServerRunning(serverId)) {
    await startLocalServer(serverId, queryPort);
  }
}

function registerDailySchedule(
  serverId: string,
  action: ScheduleAction,
  schedule: DailySchedule,
  execute: () => Promise<void>,
) {
  clearScheduleTimer(serverId, action);

  if (!schedule.enabled) {
    return;
  }

  const delay = getMsUntilNextOccurrence(schedule.time);

  timers.set(
    timerKey(serverId, action),
    setTimeout(async () => {
      try {
        await execute();
      } catch (e) {
        //
      } finally {
        registerDailySchedule(serverId, action, schedule, execute);
      }
    }, delay),
  );
}

export async function rescheduleServer(serverId: string) {
  clearAllScheduleTimers(serverId);

  try {
    const serverInfo = await getServerInfoByServerId(serverId);
    const scheduledStop = normalizeDailySchedule(serverInfo.scheduledStop);
    const scheduledStart = normalizeDailySchedule(serverInfo.scheduledStart);
    const scheduledRestart = normalizeDailySchedule(
      serverInfo.scheduledRestart,
    );

    registerDailySchedule(serverId, 'stop', scheduledStop, () =>
      executeScheduledStop(serverId, scheduledStop),
    );

    if (!serverInfo.isRemote) {
      registerDailySchedule(serverId, 'start', scheduledStart, () =>
        executeScheduledStart(serverId),
      );
    }

    registerDailySchedule(serverId, 'restart', scheduledRestart, () =>
      executeScheduledRestart(serverId, scheduledRestart),
    );
  } catch (e) {
    //
  }
}

export function unscheduleServer(serverId: string) {
  clearAllScheduleTimers(serverId);
}

export async function initServerScheduleService() {
  if (!fsc.existsSync(USER_SERVER_INSTANCES_PATH)) {
    return;
  }

  const serverIds = fsc.readdirSync(USER_SERVER_INSTANCES_PATH);

  await Promise.all(
    serverIds.map((serverId) => {
      const palPath = path.join(
        USER_SERVER_INSTANCES_PATH,
        serverId,
        '.pal',
      );
      if (!fsc.existsSync(palPath)) {
        return Promise.resolve();
      }
      return rescheduleServer(serverId);
    }),
  );
}
