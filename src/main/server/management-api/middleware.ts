import { NextFunction, Request, Response } from 'express';
import { ManagementApiConfig } from '../../../types/ManagementApi.types';
import { ManagementApiError } from '../../services/management-api/serverLifecycle';

function extractApiKey(req: Request) {
  const headerKey = req.header('x-api-key');
  if (headerKey) {
    return headerKey.trim();
  }

  const authorization = req.header('authorization');
  if (!authorization) {
    return '';
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() === 'bearer' && token) {
    return token.trim();
  }

  return authorization.trim();
}

export function createManagementApiAuthMiddleware(config: ManagementApiConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!config.apiKey) {
      next();
      return;
    }

    const providedKey = extractApiKey(req);
    if (providedKey !== config.apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    next();
  };
}

export function managementApiErrorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ManagementApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INVALID_REQUEST',
  });
}
