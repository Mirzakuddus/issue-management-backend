import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; organizationId: string; role: 'ADMIN' | 'MEMBER' };
    }
  }
}

@Injectable()
export class MockAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const id = req.header('x-user-id') ?? 'mock-user';
    const organizationId = req.header('x-organization-id') ?? 'mock-org';
    const role = (req.header('x-role') as 'ADMIN' | 'MEMBER') ?? 'ADMIN';
    req.user = { id, organizationId, role };
    next();
  }
}
