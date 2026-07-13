import { Express, Request, Response } from 'express';
import { readManagementApiConfig } from '../../services/management-api/managementApiConfig';
import {
  getServerLifecycleStatus,
  listServerLifecycleStatuses,
  restartManagedServer,
  startManagedServer,
  stopManagedServer,
} from '../../services/management-api/serverLifecycle';
import {
  createManagementApiAuthMiddleware,
  managementApiErrorHandler,
} from './middleware';

async function handleLifecycleAction(
  req: Request,
  res: Response,
  action: 'start' | 'stop' | 'restart',
) {
  const { serverId } = req.params;
  const waitMinutes = Number(req.body?.waitMinutes);
  const message =
    typeof req.body?.message === 'string' ? req.body.message : undefined;
  const options = {
    waitMinutes: Number.isFinite(waitMinutes) ? waitMinutes : undefined,
    message,
  };

  if (action === 'start') {
    res.json(await startManagedServer(serverId));
    return;
  }

  if (action === 'stop') {
    res.json(await stopManagedServer(serverId, options));
    return;
  }

  res.json(await restartManagedServer(serverId, options));
}

export function registerManagementApiRoutes(app: Express) {
  const config = readManagementApiConfig();
  const requireApiKey = createManagementApiAuthMiddleware(config);

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      enabled: config.enabled,
      port: config.port,
      bindAddress: config.bindAddress,
    });
  });

  app.use('/api', requireApiKey);

  app.get('/api/servers', async (_req, res, next) => {
    try {
      const servers = await listServerLifecycleStatuses();
      res.json({ servers });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/servers/:serverId/status', async (req, res, next) => {
    try {
      res.json(await getServerLifecycleStatus(req.params.serverId));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/servers/:serverId/start', async (req, res, next) => {
    try {
      await handleLifecycleAction(req, res, 'start');
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/servers/:serverId/stop', async (req, res, next) => {
    try {
      await handleLifecycleAction(req, res, 'stop');
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/servers/:serverId/restart', async (req, res, next) => {
    try {
      await handleLifecycleAction(req, res, 'restart');
    } catch (error) {
      next(error);
    }
  });

  app.use(managementApiErrorHandler);
}
