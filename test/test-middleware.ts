import { NextFunction, Request, Response } from 'express';

import { RestMiddleware } from '../src/interfaces/rest-middleware';

export class TestMiddleware implements RestMiddleware {
  public use(req: Request, _res: Response, next: NextFunction): void {
    console.log('Request to', req.path);
    next();
  }
}
