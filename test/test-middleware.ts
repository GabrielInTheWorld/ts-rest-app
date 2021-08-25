import { Request } from 'express';
import { Injectable } from 'final-di';
import { RestMiddleware } from '../src/interfaces/rest-middleware';

@Injectable(TestMiddleware)
export class TestMiddleware implements RestMiddleware {
  public use(req: Request): void {
    console.log('Request to', req.path);
  }
}
