import { NextFunction, Request, Response } from 'express';
import { Injectable } from 'final-di';

import { RestMiddleware } from '../src/interfaces/rest-middleware';

@Injectable(TestMiddleware)
export class TestMiddleware implements RestMiddleware {
  public use(req: Request, _res: Response, next: NextFunction): void {
    console.log('Request to', req.path);
    next();
  }
}
